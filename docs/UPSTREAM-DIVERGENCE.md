# Upstream divergence

This repository is a fork of `twentyhq/twenty` and tracks its `main` branch through the
`upstream` remote. The eMobility-Innovations default branch is `emobility-unity`.

GitHub Actions is permanently unavailable for the eMobility-Innovations organization by operator
decision. The following 35 upstream workflow paths are therefore removed from this fork:

- `.github/workflows/cd-deploy-main.yaml`
- `.github/workflows/cd-deploy-tag.yaml`
- `.github/workflows/changed-files.yaml`
- `.github/workflows/ci-ai-catalog-sync.yaml`
- `.github/workflows/ci-breaking-changes.yaml`
- `.github/workflows/ci-create-app-e2e-hello-world.yaml`
- `.github/workflows/ci-create-app-e2e-minimal.yaml`
- `.github/workflows/ci-create-app-e2e-postcard.yaml`
- `.github/workflows/ci-create-app.yaml`
- `.github/workflows/ci-docs.yaml`
- `.github/workflows/ci-emails.yaml`
- `.github/workflows/ci-example-app-hello-world.yaml`
- `.github/workflows/ci-example-app-postcard.yaml`
- `.github/workflows/ci-front-component-renderer.yaml`
- `.github/workflows/ci-front.yaml`
- `.github/workflows/ci-merge-queue.yaml`
- `.github/workflows/ci-release-create.yaml`
- `.github/workflows/ci-release-merge.yaml`
- `.github/workflows/ci-sdk.yaml`
- `.github/workflows/ci-server.yaml`
- `.github/workflows/ci-shared.yaml`
- `.github/workflows/ci-test-docker-compose.yaml`
- `.github/workflows/ci-ui.yaml`
- `.github/workflows/ci-utils.yaml`
- `.github/workflows/ci-website.yaml`
- `.github/workflows/ci-zapier.yaml`
- `.github/workflows/claude.yml`
- `.github/workflows/docs-i18n-pull.yaml`
- `.github/workflows/docs-i18n-push.yaml`
- `.github/workflows/i18n-pull.yaml`
- `.github/workflows/i18n-push.yaml`
- `.github/workflows/post-ci-comments.yaml`
- `.github/workflows/preview-env-dispatch.yaml`
- `.github/workflows/preview-env-keepalive.yaml`
- `.github/workflows/visual-regression-dispatch.yaml`

The gate and synchronization policy are intentionally maintained as fork-only files. On later
upstream syncs, `sync-upstream.sh` removes workflows again. The running record of those removals is
available with:

```sh
git log --grep="dropping upstream .github/workflows"
```
