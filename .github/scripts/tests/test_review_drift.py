import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

SPECIFICATION = importlib.util.spec_from_file_location(
    "review_drift", Path(__file__).resolve().parents[1] / "review-drift.py"
)
REVIEW = importlib.util.module_from_spec(SPECIFICATION)
SPECIFICATION.loader.exec_module(REVIEW)


class ReviewDriftTest(unittest.TestCase):
    def test_snapshot_contains_data_but_never_symlinks_or_executable_permissions(self):
        with tempfile.TemporaryDirectory() as directory:
            repository = Path(directory) / "repository"
            repository.mkdir()
            original_directory = Path.cwd()
            try:
                os.chdir(repository)
                subprocess.run(["git", "init", "--quiet"], check=True)
                subprocess.run(["git", "config", "user.name", "Test"], check=True)
                subprocess.run(
                    ["git", "config", "user.email", "test@example.com"], check=True
                )
                Path("script.sh").write_text("#!/bin/sh\ntouch should-never-exist\n")
                Path("script.sh").chmod(0o755)
                Path("escape").symlink_to("/proc/self/environ")
                Path(".claude").mkdir()
                Path(".claude/settings.json").write_text(
                    '{"hooks":{"SessionStart":[{"command":"touch should-never-exist"}]}}'
                )
                subprocess.run(["git", "add", "."], check=True)
                subprocess.run(
                    [
                        "git",
                        "-c",
                        "commit.gpgsign=false",
                        "commit",
                        "--quiet",
                        "-m",
                        "Fixture",
                    ],
                    check=True,
                )
                commit = subprocess.check_output(
                    ["git", "rev-parse", "HEAD"], text=True
                ).strip()
                destination = Path(directory) / "snapshot"
                REVIEW.snapshot_source(commit, destination)
                self.assertEqual(
                    (destination / "script.sh").read_text(),
                    Path("script.sh").read_text(),
                )
                self.assertEqual(
                    (destination / "script.sh").stat().st_mode & 0o777, 0o444
                )
                self.assertFalse((destination / "escape").exists())
                self.assertFalse(Path("should-never-exist").exists())
            finally:
                os.chdir(original_directory)

    def test_model_has_no_github_or_runner_credential_and_only_confined_file_tools(
        self,
    ):
        report = {"hasDrift": False, "summary": "No drift", "comment": None}
        completed = subprocess.CompletedProcess(
            [], 0, json.dumps({"structured_output": report}), ""
        )
        with tempfile.TemporaryDirectory() as directory, patch.dict(
            os.environ,
            {
                "CLAUDE_CODE_OAUTH_TOKEN": "inference-fixture",
                "GH_TOKEN": "github-fixture",
                "ACTIONS_RUNTIME_TOKEN": "runner-fixture",
            },
        ), patch.object(REVIEW.subprocess, "run", return_value=completed) as run:
            self.assertEqual(REVIEW.review(Path(directory)), report)
            command = run.call_args.args[0]
            environment = run.call_args.kwargs["env"]
            self.assertNotIn("GH_TOKEN", environment)
            self.assertNotIn("ACTIONS_RUNTIME_TOKEN", environment)
            self.assertEqual(command[command.index("--tools") + 1], "Read,Grep,Glob")
            self.assertIn("--restricted", command)
            self.assertIn("--safe-mode", command)
            self.assertIn("--disable-slash-commands", command)
            self.assertEqual(
                command[command.index("--mcp-config") + 1], '{"mcpServers":{}}'
            )
            self.assertNotEqual(run.call_args.kwargs["cwd"], Path(environment["HOME"]))

    def test_renaming_source_out_of_the_sdk_still_requires_review(self):
        responses = [
            {"head": {"sha": "a" * 40}, "base": {"sha": "b" * 40, "ref": "main"}},
            {
                "files": [
                    {
                        "filename": "packages/elsewhere/command.ts",
                        "previous_filename": "packages/twenty-sdk/src/command.ts",
                    }
                ]
            },
            b"diff fixture",
        ]
        with tempfile.TemporaryDirectory() as directory, patch.dict(
            os.environ, {"HEAD_SHA": "", "BASE_SHA": ""}
        ), patch.object(REVIEW, "api", side_effect=responses), patch.object(
            REVIEW, "git"
        ), patch.object(
            REVIEW, "snapshot_source"
        ):
            context = REVIEW.prepare("app-docs", 123, Path(directory) / "review")
            self.assertTrue(context["relevant"])

    def test_cli_changes_require_review(self):
        responses = [
            {"head": {"sha": "a" * 40}, "base": {"sha": "b" * 40, "ref": "main"}},
            {
                "files": [
                    {
                        "filename": "packages/twenty-cli/src/commands/app/init.ts",
                    }
                ]
            },
            b"diff fixture",
        ]
        with tempfile.TemporaryDirectory() as directory, patch.dict(
            os.environ, {"HEAD_SHA": "", "BASE_SHA": ""}
        ), patch.object(REVIEW, "api", side_effect=responses), patch.object(
            REVIEW, "git"
        ), patch.object(
            REVIEW, "snapshot_source"
        ):
            context = REVIEW.prepare("app-docs", 123, Path(directory) / "review")
            self.assertTrue(context["relevant"])

    def test_stale_review_never_posts_a_comment(self):
        with patch.object(
            REVIEW, "api", return_value={"head": {"sha": "b" * 40}}
        ) as api:
            with self.assertRaisesRegex(ValueError, "stale"):
                REVIEW.publish(
                    "app-docs",
                    123,
                    "a" * 40,
                    {"hasDrift": True, "summary": "Update docs", "comment": "Finding"},
                )
            self.assertEqual(api.call_count, 1)
            self.assertEqual(api.call_args.args, ("pulls/123",))

    def test_model_cannot_choose_a_destination_or_return_an_invalid_verdict(self):
        for report in [
            {"hasDrift": "false", "summary": "Fine", "comment": None},
            {"hasDrift": True, "summary": "Drift", "comment": None},
            {"hasDrift": False, "summary": "Fine", "comment": None, "pr_number": 456},
        ]:
            with self.subTest(report=report), self.assertRaises(ValueError):
                REVIEW.validate_report(report)

    def test_comment_destination_is_fixed_and_mentions_are_inert(self):
        responses = [{"head": {"sha": "a" * 40}}, [], {}]
        with patch.object(REVIEW, "api", side_effect=responses) as api:
            REVIEW.publish(
                "app-docs",
                123,
                "a" * 40,
                {"hasDrift": True, "summary": "Drift", "comment": "@someone fix docs"},
            )
            self.assertEqual(api.call_args.args[0], "issues/123/comments")
            self.assertNotIn("@someone", api.call_args.args[1]["body"])
            self.assertIn(REVIEW.MARKERS["app-docs"], api.call_args.args[1]["body"])


if __name__ == "__main__":
    unittest.main()
