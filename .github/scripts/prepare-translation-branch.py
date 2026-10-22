import argparse
import re
import subprocess

TRANSLATION_PATHS = {
    "i18n": re.compile(
        r"packages/(twenty-front/src/locales|twenty-emails/src/locales|"
        r"twenty-server/src/engine/core-modules/i18n/locales)/[^/]+\.po"
    ),
    "i18n-website": re.compile(r"packages/twenty-website/src/locales/[^/]+\.po"),
    "i18n-docs": re.compile(
        r"packages/twenty-docs/(ar|cs|de|es|fr|it|ja|ko|pt|ro|ru|tr|zh)/.+\.mdx"
    ),
}


def git(*arguments):
    return subprocess.check_output(["git", *arguments])


def prepare_translation_branch(branch):
    trusted_commit = git("rev-parse", "HEAD").decode().strip()
    fetched = subprocess.run(["git", "fetch", "--no-tags", "origin", branch])
    translation_commit = (
        git("rev-parse", "FETCH_HEAD").decode().strip()
        if fetched.returncode == 0
        else trusted_commit
    )
    paths = []
    for entry in git("ls-tree", "-rz", "--full-tree", translation_commit).split(b"\0"):
        if not entry:
            continue
        metadata, path = entry.split(b"\t", 1)
        mode, object_type, _ = metadata.split()
        if (
            mode == b"100644"
            and object_type == b"blob"
            and TRANSLATION_PATHS[branch].fullmatch(path.decode())
        ):
            paths.append(path.decode())
    git("checkout", "-B", branch, translation_commit)
    # Preserve branch history, but never execute its scripts or restore its symlinks.
    git("read-tree", "--reset", "-u", trusted_commit)
    if paths:
        git("restore", "--source", translation_commit, "--staged", "--worktree", "--", *paths)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("branch", choices=TRANSLATION_PATHS)
    prepare_translation_branch(parser.parse_args().branch)
