import copy
import io
import json
from pathlib import Path
import re
import sys
import tarfile


def prepare_staging_tarball(tarball, source_version, staging_version):
    if not re.fullmatch(
        re.escape(source_version) + r"-alpha\.(0|[1-9][0-9]*)", staging_version
    ):
        raise ValueError("Expected a matching alpha version")
    temporary_tarball = tarball.with_suffix(".staging.tgz")
    manifests = 0
    try:
        with tarfile.open(tarball, "r:gz") as source, tarfile.open(
            temporary_tarball, "w:gz"
        ) as target:
            for member in source:
                content = source.extractfile(member) if member.isfile() else None
                if member.name == "package/package.json":
                    if not member.isfile():
                        raise ValueError("Package manifest must be a regular file")
                    manifests += 1
                    manifest = json.load(content)
                    if manifest["version"] != source_version:
                        raise ValueError("Source version mismatch")
                    manifest["version"] = staging_version
                    manifest["description"] = (
                        "OIDC validation only. Do not approve this staged package."
                    )
                    data = (json.dumps(manifest, indent=2) + "\n").encode()
                    member = copy.copy(member)
                    member.size = len(data)
                    content = io.BytesIO(data)
                target.addfile(member, content)
        if manifests != 1:
            raise ValueError("Expected exactly one package manifest")
        temporary_tarball.replace(tarball)
    finally:
        temporary_tarball.unlink(missing_ok=True)


if __name__ == "__main__":
    prepare_staging_tarball(Path(sys.argv[1]), sys.argv[2], sys.argv[3])
