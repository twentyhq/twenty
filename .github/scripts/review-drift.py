import argparse
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import tempfile
import urllib.request

SOURCE_PREFIXES = (
    "packages/twenty-cli/",
    "packages/twenty-sdk/",
    "packages/create-twenty-app/",
    "packages/twenty-client-sdk/",
    "packages/twenty-shared/src/application/",
    "packages/twenty-shared/src/types/",
)
PROMPTS = {"app-docs": "app-docs.md", "agent-skills": "agent-skills.md"}
MARKERS = {
    "app-docs": "<!-- app-docs-drift-check -->",
    "agent-skills": "<!-- agent-skills-drift-check -->",
}
SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "hasDrift": {"type": "boolean"},
        "summary": {"type": "string", "maxLength": 1000},
        "comment": {"type": ["string", "null"], "maxLength": 24000},
    },
    "required": ["hasDrift", "summary", "comment"],
}


def git(*arguments):
    return subprocess.check_output(["git", *arguments])


def api(path, payload=None, accept="application/vnd.github+json"):
    request = urllib.request.Request(
        "https://api.github.com/repos/twentyhq/twenty/" + path,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={
            "Authorization": "Bearer " + os.environ["GH_TOKEN"],
            "Accept": accept,
            "X-GitHub-Api-Version": "2022-11-28",
        },
        method="POST" if payload is not None else "GET",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        content = response.read()
    return json.loads(content) if accept == "application/vnd.github+json" else content


def validate_commit(value):
    if not re.fullmatch(r"[a-f0-9]{40}", value):
        raise ValueError("Expected a complete commit SHA")
    return value


def snapshot_source(commit, destination):
    entries = git("ls-tree", "-rz", "--full-tree", validate_commit(commit)).split(b"\0")
    total_size = 0
    with subprocess.Popen(
        ["git", "cat-file", "--batch"], stdin=subprocess.PIPE, stdout=subprocess.PIPE
    ) as process:
        try:
            for entry in entries:
                if not entry:
                    continue
                metadata, encoded_path = entry.split(b"\t", 1)
                mode, object_type, object_sha = metadata.split()
                path = PurePosixPath(encoded_path.decode())
                if path.is_absolute() or ".." in path.parts:
                    raise ValueError("Invalid source path")
                # Symlinks and submodules must not escape the reviewer snapshot.
                if mode not in [b"100644", b"100755"] or object_type != b"blob":
                    continue
                process.stdin.write(object_sha + b"\n")
                process.stdin.flush()
                returned_sha, returned_type, encoded_size = (
                    process.stdout.readline().split()
                )
                size = int(encoded_size)
                if returned_sha != object_sha or returned_type != b"blob":
                    raise ValueError("Unexpected Git object")
                if size > 2 * 1024 * 1024:
                    while size:
                        chunk = process.stdout.read(min(size, 65536))
                        if not chunk:
                            raise ValueError("Incomplete Git object")
                        size -= len(chunk)
                    process.stdout.read(1)
                    continue
                content = process.stdout.read(size)
                if len(content) != size or process.stdout.read(1) != b"\n":
                    raise ValueError("Incomplete Git object")
                if b"\0" in content:
                    continue
                total_size += size
                if total_size > 256 * 1024 * 1024:
                    raise ValueError("Reviewer snapshot exceeds size limit")
                target = destination.joinpath(*path.parts)
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(content)
                target.chmod(0o444)
        finally:
            process.stdin.close()
            process.wait()


def prepare(kind, pr_number, directory):
    pull_request = api(f"pulls/{pr_number}")
    head = validate_commit(pull_request["head"]["sha"])
    base = validate_commit(pull_request["base"]["sha"])
    if pull_request["base"]["ref"] != "main":
        raise ValueError("Only PRs targeting main are supported")
    for name, value in [("HEAD_SHA", head), ("BASE_SHA", base)]:
        if os.environ.get(name) and os.environ[name] != value:
            raise ValueError("PR changed since the review was requested")
    comparison = api(f"compare/{base}...{head}")
    files = comparison.get("files", [])
    # The compare API caps its file list; a large PR must not silently skip review.
    if len(files) >= 300:
        raise ValueError("PR is too large for the drift file filter")
    relevant = any(
        file.get(field, "").startswith(SOURCE_PREFIXES)
        for file in files
        for field in ["filename", "previous_filename"]
    )
    context = {
        "pr_number": pr_number,
        "head_sha": head,
        "base_sha": base,
        "kind": kind,
        "relevant": relevant,
    }
    directory.mkdir(parents=True, exist_ok=False)
    (directory / "context.json").write_text(json.dumps(context))
    if relevant:
        git("fetch", "--no-tags", "--depth=1", "origin", head)
        snapshot_source(head, directory / "source")
        diff = api(f"compare/{base}...{head}", accept="application/vnd.github.v3.diff")
        (directory / "pr.diff").write_bytes(diff)
        prompt = Path(__file__).resolve().parents[1] / "review-prompts" / PROMPTS[kind]
        (directory / "instructions.md").write_text(prompt.read_text())
    return context


def reviewer_command():
    return [
        "claude",
        "-p",
        "Read instructions.md and perform the drift review.",
        "--restricted",
        "--safe-mode",
        "--setting-sources",
        "",
        "--tools",
        "Read,Grep,Glob",
        "--allowedTools",
        "Read,Grep,Glob",
        "--strict-mcp-config",
        "--mcp-config",
        '{"mcpServers":{}}',
        "--disallowedTools",
        "mcp__*",
        "--disable-slash-commands",
        "--no-session-persistence",
        "--max-turns",
        "60",
        "--output-format",
        "json",
        "--json-schema",
        json.dumps(SCHEMA),
    ]


def validate_report(report):
    if set(report) != {"hasDrift", "summary", "comment"}:
        raise ValueError("Unexpected review fields")
    if type(report["hasDrift"]) is not bool:
        raise ValueError("Invalid drift verdict")
    if (
        not isinstance(report["summary"], str)
        or not report["summary"]
        or len(report["summary"]) > 1000
    ):
        raise ValueError("Invalid review summary")
    comment = report["comment"]
    if comment is not None and (
        not isinstance(comment, str) or not comment or len(comment) > 24000
    ):
        raise ValueError("Invalid review comment")
    if report["hasDrift"] and not comment:
        raise ValueError("Drift findings require a comment")
    return report


def review(directory):
    with tempfile.TemporaryDirectory(prefix="drift-auth-") as home:
        # GitHub and runner credentials never enter the model process environment.
        environment = {
            "PATH": os.environ["PATH"],
            "HOME": home,
            "CLAUDE_CONFIG_DIR": str(Path(home) / ".claude"),
            "CLAUDE_CODE_OAUTH_TOKEN": os.environ["CLAUDE_CODE_OAUTH_TOKEN"],
            "CI": "true",
            "DISABLE_NONESSENTIAL_TRAFFIC": "1",
        }
        completed = subprocess.run(
            reviewer_command(),
            cwd=directory,
            env=environment,
            capture_output=True,
            text=True,
            timeout=1200,
        )
    if completed.returncode:
        raise RuntimeError("Restricted drift reviewer failed")
    result = json.loads(completed.stdout)
    if result.get("is_error"):
        raise RuntimeError("Restricted drift reviewer returned an error")
    return validate_report(result["structured_output"])


def publish(kind, pr_number, head, report):
    validate_report(report)
    pull_request = api(f"pulls/{pr_number}")
    if pull_request["head"]["sha"] != validate_commit(head):
        raise ValueError("Refusing to publish a stale review")
    if report["comment"] is None:
        return
    title = "App docs drift check" if kind == "app-docs" else "Agent skills drift check"
    body = (
        MARKERS[kind]
        + "\n### "
        + title
        + "\n\n"
        + report["comment"].replace("@", "@\u200b")
    )
    # The API destination comes from trusted event metadata, never model output.
    page = 1
    while True:
        comments = api(f"issues/{pr_number}/comments?per_page=100&page={page}")
        for comment in comments:
            if (
                comment["user"]["login"] == "github-actions[bot]"
                and MARKERS[kind] in comment["body"]
            ):
                request = urllib.request.Request(
                    f"https://api.github.com/repos/twentyhq/twenty/issues/comments/{int(comment['id'])}",
                    data=json.dumps({"body": body}).encode(),
                    headers={
                        "Authorization": "Bearer " + os.environ["GH_TOKEN"],
                        "Accept": "application/vnd.github+json",
                    },
                    method="PATCH",
                )
                with urllib.request.urlopen(request, timeout=60):
                    return
        if len(comments) < 100:
            break
        page += 1
    api(f"issues/{pr_number}/comments", {"body": body})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("operation", choices=["prepare", "review", "publish"])
    parser.add_argument("--kind", choices=PROMPTS, required=True)
    parser.add_argument("--pr-number", type=int, required=True)
    arguments = parser.parse_args()
    if arguments.pr_number < 1:
        raise ValueError("Invalid PR number")
    directory = Path(os.environ["REVIEW_DIRECTORY"])
    if arguments.operation == "prepare":
        context = prepare(arguments.kind, arguments.pr_number, directory)
        with open(os.environ["GITHUB_OUTPUT"], "a") as output:
            output.write("relevant=" + str(context["relevant"]).lower() + "\n")
            output.write("head_sha=" + context["head_sha"] + "\n")
    elif arguments.operation == "review":
        report = review(directory)
        Path(os.environ["REPORT_PATH"]).write_text(json.dumps(report))
        with open(os.environ["GITHUB_OUTPUT"], "a") as output:
            output.write("report=" + json.dumps(report, separators=(",", ":")) + "\n")
    else:
        publish(
            arguments.kind,
            arguments.pr_number,
            os.environ["HEAD_SHA"],
            json.loads(os.environ["REPORT"]),
        )


if __name__ == "__main__":
    main()
