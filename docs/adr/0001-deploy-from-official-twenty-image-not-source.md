---
status: superseded by ADR-0002
---

# Deploy from the official Twenty Docker image, not by building this fork

Phase 1 deployment runs Twenty on the VPS from the published `twentycrm/twenty` Docker image (as the stock `packages/twenty-docker/docker-compose.yml` already does), plus a small ops directory (compose overrides, Caddyfile, backup scripts). It does not build or deploy this ~2GB monorepo fork from source. Custom behavior (e.g. the Invoice app) is installed into the running instance via Twenty's Apps-framework CLI, not by patching Twenty's core. This means the VPS never needs this git checkout, and CI/build pipelines for Twenty's own server/front code are not a JAI OS concern. Revisit only if a JAI OS requirement ever needs to patch Twenty's own core (not just extend it via an app) — that would force building from source instead.
