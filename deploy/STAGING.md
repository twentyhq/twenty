# Staging on the production Mac

Staging is a Docker Compose environment isolated from the live native services.
It uses:

- project name `twenty-staging`
- an explicit web bind address and port 3020
- private container-only Postgres and Redis
- staging-only database and storage volumes
- a GHCR image pinned to a full commit SHA
- disabled cron registration and logged email

It does not publish its database or Redis ports to the host.

## Remote access through Tailscale

Production and staging run side by side on different HTTPS listeners.
Production remains on port 443, while Tailscale Serve proxies tailnet-only
HTTPS port 3020 to staging's localhost listener.

On the production Mac, find the active Tailscale address:

```bash
ifconfig | grep -A2 '^utun' | grep 'inet 100\.'
```

Then set:

```dotenv
STAGING_BIND_ADDRESS=127.0.0.1
STAGING_TAILNET_ADDRESS=<spectech-llm Tailscale IPv4>
STAGING_TAILNET_HOSTNAME=spectech-llm.<tailnet>.ts.net
STAGING_SERVER_URL=https://spectech-llm.<tailnet>.ts.net:3020
```

Start both staging and its tailnet relay:

```bash
bash deploy/staging.sh up
bash deploy/staging.sh tailnet-up
```

Another device on the same tailnet can then open:

```text
https://spectech-llm.<tailnet>.ts.net:3020
```

The traffic is encrypted by Tailscale and staging is not exposed through the
production listener. Do not bind staging to `0.0.0.0`. Stop remote access
without stopping staging using `bash deploy/staging.sh tailnet-down`.

## Google authentication

Google login requires the staging HTTPS endpoint and separate authorized
redirect URIs. Populate staging's ignored environment configuration:

```bash
bash deploy/sync-staging-google-auth.sh
```

The Google OAuth client must authorize these exact redirect URIs:

```text
https://spectech-llm.<tailnet>.ts.net:3020/auth/google/redirect
https://spectech-llm.<tailnet>.ts.net:3020/auth/google-apis/get-access-token
```

Restart staging after changing authentication configuration.

## Install a container runtime

This Mac uses the Docker CLI, Docker Compose, and Colima:

```bash
brew install docker docker-compose colima
colima start --cpu 4 --memory 8 --disk 60
docker version
docker-compose version
```

Colima runs a Linux VM for containers. It does not alter the existing native
production Postgres, Redis, backend, worker, or frontend. Start Colima before
using staging and stop it with `colima stop` when staging is not needed.

## Configure once

```bash
cp deploy/.env.staging.example deploy/.env.staging
openssl rand -hex 32
openssl rand -hex 32
```

Put the two generated values in `deploy/.env.staging`. Set `STAGING_IMAGE` to a
full commit-SHA tag produced by the `Build and push custom image` GitHub Action:

```dotenv
STAGING_IMAGE=ghcr.io/speculativetechnologies/twenty:<full-commit-sha>
```

Authenticate Docker to GHCR if the package is private.

If an exact-SHA GHCR image has not been published, build that checked-out
commit locally for a one-machine staging test:

```bash
docker build --platform linux/arm64 \
  --target twenty \
  -t twenty-staging:$(git rev-parse HEAD) \
  -f packages/twenty-docker/twenty/Dockerfile .
```

Then set `STAGING_IMAGE=twenty-staging:<full-commit-sha>` and
`STAGING_PLATFORM=linux/arm64`. A local image validates the stack, but a release
should ultimately stage the same registry artifact that production will use.

## Validate, start, and test

```bash
bash deploy/staging.sh config
bash deploy/staging.sh up
bash deploy/staging.sh test
```

Open `http://localhost:3020`.

Useful operations:

```bash
bash deploy/staging.sh ps
bash deploy/staging.sh logs
bash deploy/staging.sh stop
bash deploy/staging.sh down
```

`down` preserves staging data. There is deliberately no convenient reset
command. If staging data must be destroyed, resolve the exact Compose project
first and then explicitly run:

```bash
docker compose --env-file deploy/.env.staging \
  -f deploy/compose.staging.yml down --volumes
```

That command is destructive to staging only.

## Release test

Before production promotion:

1. Refresh the data clone:

   ```bash
   bash deploy/refresh-staging-from-production.sh --yes
   ```

2. Confirm the staged image tag equals the intended Git SHA.
3. Run `bash deploy/staging.sh test`.
4. Sign in and test people, companies, search, editing, and navigation.
5. Exercise the feature being released.
6. For schema changes, inspect server logs for upgrade failures.
7. Confirm production remains healthy and its records are unchanged.

## Production-data refresh

`refresh-staging-from-production.sh` is deliberately guarded by `--yes`. It:

1. Verifies the source database is production `default` and the destination is
   staging `staging`.
2. Stops only the staging server and worker.
3. Takes a consistent read-only production dump and restores it into staging.
4. Copies production-uploaded files into the staging-only storage volume.
5. Clears staging Redis.
6. Disables message/calendar sync, clears connected-account credentials,
   deactivates active workflows, neutralizes webhooks, and removes production
   custom domains. It also removes the production JWT signing key; staging
   generates its own key, encrypted with `STAGING_ENCRYPTION_KEY`, on the next
   successful login.
7. Starts staging, runs migrations/upgrades, and verifies workspace counts,
   side-effect controls, local health, and tailnet health.

The scheduled launch agent refreshes staging daily at 4:15 AM. Its source is:

```text
deploy/launchd/com.twenty.staging-refresh.plist
```

Its installed copy belongs at:

```text
~/Library/LaunchAgents/com.twenty.staging-refresh.plist
```

Logs are written to `/tmp/twenty-staging-refresh.log`. A refresh intentionally
replaces changes made only in staging, so durable changes must live in Git.

## Deploying a branch without SSH

Anyone with repository access can put a commit on staging from GitHub, without
a shell on this machine.

1. Label the pull request `needs-staging`. CI builds an image tagged with the
   branch head SHA.
2. Run the **Deploy to staging** workflow and give it the branch, tag, or SHA.
   It checks the commit exists and that an image was published for it, then
   moves the `staging-target` ref and records a GitHub Deployment.
3. `staging-converge.sh` on this host notices within two minutes, pulls the
   image, restarts staging and runs the smoke tests.

Nothing in that path reaches into this machine. The workflow only moves a ref;
the host polls it and pulls. That is deliberate, because this machine also runs
production, and it is why there is no self-hosted runner here.

If the deploy fails, the converger restores the image that was serving before
rather than leaving staging down.

Install the converger with:

```bash
cp deploy/launchd/com.twenty.staging-converge.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.twenty.staging-converge.plist
```

It logs to `/tmp/twenty-staging-converge.log`, and takes the same lock as the
data refresh so the two cannot overlap.

This host must be logged in to GHCR (`docker login ghcr.io`) or every
convergence fails at the image check.

To have staging report back to the GitHub Deployment, put a token with
`deployments: write` at `~/.config/twenty-staging/github-token`. Without it the
converger still works; the deployment just stays in progress in the UI.
