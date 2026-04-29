# ADR-0001: Build Podman Images From Local Source

## Status
Accepted

## Context
The Podman stack was running `server` and `worker` from `twentycrm/twenty:latest`
and serving `frontend` from a prebuilt `build/` directory. That meant local
changes in styles, loaders, or workflow code could disappear until the image or
frontend bundle was rebuilt manually.

## Decision
Build `server`, `worker`, and `frontend` from repository source when the Podman
stack starts. Keep the frontend behind nginx, but package its static assets into
its own image instead of mounting a host-side build directory.

## Consequences
- Local source changes become visible after `podman-compose up -d --build`.
- The stack no longer depends on remote `latest` tags.
- First startup is slower because images are rebuilt locally.
- Runtime behavior is closer to the checked-out source tree.
