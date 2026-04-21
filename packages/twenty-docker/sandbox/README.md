# twentycrm/sandbox

Sandbox image used by the `DOCKER` code-interpreter driver
(`packages/twenty-server/.../drivers/docker.driver.ts`).

## Build

```bash
cd packages/twenty-server
docker build \
  -t twentycrm/sandbox:dev \
  -f ../twenty-docker/sandbox/Dockerfile \
  src/engine/core-modules/code-interpreter
```

The build context is the `code-interpreter` module so the Dockerfile's
`COPY sandbox-scripts/` resolves against the canonical location of those
helpers.

## Contents

- **Python 3.12** slim base.
- **Data-science libs** — pandas, numpy, matplotlib, pillow.
- **Office-document libs** — python-docx, python-pptx, openpyxl, pypdf,
  pdfplumber, reportlab.
- **HTTP** — requests (user code calls back into Twenty's API via
  `TWENTY_SERVER_URL` + `TWENTY_API_TOKEN` injected by the driver).
- **Pre-seeded scripts** at `/home/user/scripts/` covering docx/pdf/pptx/xlsx
  helpers (validation, packing/unpacking, redlining, form fills).
- **Non-root `user`** uid 1000 with home `/home/user`.

## How the driver uses it

The driver creates one container per code-interpreter call:

1. Stages a host work directory at `$DOCKER_SANDBOX_WORK_DIR/run-*`.
2. Bind-mounts that dir at `/home/user` inside the container, shadowing the
   baked-in home (the pre-seeded scripts at `/home/user/scripts/` are still
   visible via the same bind mount — they're part of the image layer below
   the mount point).
3. Writes input files to the host side of the bind.
4. `exec`s `python -u -c <user-code>` inside the already-running container.
5. Reads output files from the host side of the bind.
6. Removes the container.

Hardening flags applied per container by the driver (not by this image):

- `ReadonlyRootfs: true`
- `CapDrop: ['ALL']`
- `SecurityOpt: ['no-new-privileges']`
- `NetworkMode` set to an internal (no-egress) network that only reaches
  the Twenty `server` container.
- `Memory` and `PidsLimit` capped per `DOCKER_SANDBOX_MEMORY_MB` and
  `DOCKER_SANDBOX_PIDS_LIMIT`.
