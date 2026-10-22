import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "prepare-npm-staging.py"
spec = importlib.util.spec_from_file_location("staging", SCRIPT)
staging = importlib.util.module_from_spec(spec)
spec.loader.exec_module(staging)


class PrepareStagingTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.tarball = Path(self.directory.name) / "package.tgz"
        with tarfile.open(self.tarball, "w:gz") as archive:
            for name, data in {
                "package/package.json": json.dumps(
                    {
                        "name": "twenty-sdk",
                        "version": "2.51.0",
                        "dependencies": {"example": "^1.0.0"},
                    }
                ).encode(),
                "package/dist/index.js": b"export const value = 42;\n",
            }.items():
                member = tarfile.TarInfo(name)
                member.size = len(data)
                member.mode = 0o644
                archive.addfile(member, io.BytesIO(data))

    def test_only_version_and_warning_change(self):
        staging.prepare_staging_tarball(self.tarball, "2.51.0", "2.51.0-alpha.0")
        with tarfile.open(self.tarball) as archive:
            manifest = json.load(archive.extractfile("package/package.json"))
            self.assertEqual(manifest["version"], "2.51.0-alpha.0")
            self.assertEqual(manifest["dependencies"], {"example": "^1.0.0"})
            self.assertIn("Do not approve", manifest["description"])
            self.assertEqual(
                archive.extractfile("package/dist/index.js").read(),
                b"export const value = 42;\n",
            )

    def test_invalid_versions_leave_archive_unchanged(self):
        original = self.tarball.read_bytes()
        for version in (
            "2.51.0",
            "2.51.0-beta.0",
            "2.50.0-alpha.0",
            "2.51.0-alpha.01",
            "2.51.0-alpha.0\n",
        ):
            with self.subTest(version=version), self.assertRaises(ValueError):
                staging.prepare_staging_tarball(self.tarball, "2.51.0", version)
            self.assertEqual(self.tarball.read_bytes(), original)

    def test_source_mismatch_leaves_archive_unchanged(self):
        original = self.tarball.read_bytes()
        with self.assertRaises(ValueError):
            staging.prepare_staging_tarball(self.tarball, "2.50.0", "2.50.0-alpha.0")
        self.assertEqual(self.tarball.read_bytes(), original)
        self.assertFalse(self.tarball.with_suffix(".staging.tgz").exists())


if __name__ == "__main__":
    unittest.main()
