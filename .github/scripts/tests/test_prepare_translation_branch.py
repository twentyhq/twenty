import importlib.util
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SPECIFICATION = importlib.util.spec_from_file_location(
    "prepare_translation_branch",
    Path(__file__).resolve().parents[1] / "prepare-translation-branch.py",
)
PREPARATION = importlib.util.module_from_spec(SPECIFICATION)
SPECIFICATION.loader.exec_module(PREPARATION)


class PrepareTranslationBranchTest(unittest.TestCase):
    def test_only_translation_data_survives_from_each_remote_branch(self):
        for branch, translation_path in [
            ("i18n", "packages/twenty-front/src/locales/fr.po"),
            ("i18n-website", "packages/twenty-website/src/locales/fr.po"),
            ("i18n-docs", "packages/twenty-docs/fr/guide.mdx"),
        ]:
            with self.subTest(branch=branch), tempfile.TemporaryDirectory() as directory:
                original_directory = Path.cwd()
                try:
                    os.chdir(directory)
                    self.git("init", "--initial-branch=main", ".")
                    self.git("config", "user.name", "Release regression test")
                    self.git("config", "user.email", "test@example.com")
                    self.git("config", "commit.gpgsign", "false")
                    self.git("config", "core.hooksPath", "/dev/null")
                    Path("package.json").write_text("trusted main code")
                    Path(translation_path).parent.mkdir(parents=True)
                    Path(translation_path).write_text("original translation")
                    self.git("add", ".")
                    self.git("commit", "-m", "Initial main")
                    self.git("checkout", "-b", branch)
                    Path("package.json").write_text("unreviewed executable code")
                    Path("malicious-script.py").write_text("raise RuntimeError('untrusted')")
                    Path(translation_path).write_text("updated translation")
                    symlink_path = Path(translation_path).with_name(
                        "de.mdx" if branch == "i18n-docs" else "de.po"
                    )
                    symlink_path.symlink_to(Path(directory) / "package.json")
                    self.git("add", ".")
                    self.git("commit", "-m", "Unreviewed branch changes")
                    translation_commit = self.git("rev-parse", "HEAD")
                    self.git("checkout", "main")
                    Path("package.json").write_text("latest trusted main code")
                    self.git("add", ".")
                    self.git("commit", "-m", "Update approved code")
                    self.git("clone", "--bare", ".", "remote.git")
                    self.git("remote", "add", "origin", str(Path(directory) / "remote.git"))
                    PREPARATION.prepare_translation_branch(branch)
                    self.assertEqual(Path("package.json").read_text(), "latest trusted main code")
                    self.assertEqual(Path(translation_path).read_text(), "updated translation")
                    self.assertFalse(symlink_path.is_symlink())
                    self.assertFalse(Path("malicious-script.py").exists())
                    self.assertEqual(self.git("rev-parse", "HEAD"), translation_commit)
                    self.assertEqual(self.git("diff", "--name-only", "main"), translation_path)
                finally:
                    os.chdir(original_directory)

    @staticmethod
    def git(*arguments):
        return subprocess.check_output(["git", *arguments], stderr=subprocess.DEVNULL).decode().strip()


if __name__ == "__main__":
    unittest.main()
