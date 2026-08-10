# Shipping a change

The short version of how a change gets from your laptop to the live CRM. Read
this first; [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md) is the authoritative rulebook
and the environment docs have the detail.

**You never need to log into the server.** Everything below happens on GitHub.

## How to picture it

There are three places code can be running:

| Place | What it is |
|---|---|
| **Your machine** | Where you build the change |
| **Staging** | An isolated copy of the real CRM used to validate a candidate commit. Safe to break. |
| **Production** | The live CRM everyone uses |

Staging and production run on separate Google Cloud VMs. GitHub Actions reaches
them through identity federation and IAP, deploys an image pinned to the exact
commit SHA, and waits until the deployment succeeds or rolls back. That is why
you do not need server access.

The application and its promotion workflows live in the public
`SpeculativeTechnologies/CRM` repository. The private
`SpeculativeTechnologies/crm-ops` repository contains the cloud runtime and
operational runbooks; normal feature work does not move there.

## The normal path

**1. Build it.** Branch off `main`, make your change, push, open a PR.

**2. Wait for CI.** The check is called `ci-fork-status-check`. Get it green.
Get a review.

**3. Put it on staging.** Add the label `needs-staging` to your PR. That builds
an image — takes 20–40 minutes, so add the label early. Then go to
**Actions → Deploy to staging → Run workflow** and enter your branch name.

**4. Actually try it.** Open `https://crm-staging.spec.tech` and use the thing
you changed. Click around the normal stuff too — people, companies, search.
Staging has a copy of real data, so it should feel like the real CRM.

**5. Merge your PR.**

**6. Put it on production.** Go to **Actions → Deploy to production → Run
workflow** and enter the merged commit or `main`. The run verifies that the
commit is on `main` and includes what staging ran, then pauses for Ben's
approval. Once approved, it deploys the cloud production VM and waits for the
result.

That's it. Steps 3 and 4 are the ones people skip and shouldn't.

## Two things that will trip you up

**Staging is one shared slot.** Only one branch can be on staging at a time. If
you put yours on staging, you've taken the slot until it's merged — and nobody
can deploy to production until then, because production refuses to deploy
anything that doesn't include whatever staging last tested. So: **merge what you
staged, reasonably promptly.** If you need the slot, ask.

**Production only ever runs code that's on `main`.** You can't promote a branch,
and you can't skip staging. These are enforced, not conventions — the deploy
will refuse.

## How to tell it worked

For production, watch the Actions run. A green run means the cloud VM is serving
that commit; the promotion workflow no longer reports success before the target
environment has finished deploying.

A deploy runs instance commands and workspace upgrades before switching the
application. Database changes can therefore take several minutes.

## If something looks wrong

The cloud deployment script rolls the application back automatically when a
migration or health check fails. Do not improvise a database repair or operate
the VM directly. Stop, preserve the failed workflow output, and follow the
private `crm-ops/deploy/CLOUD-OPS.md` incident and rollback guidance with Ben.

## Where the detail lives

- [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md) — the rules, review requirements, and
  what counts as an emergency change
- [DEVELOPMENT.md](DEVELOPMENT.md) — setting up your own machine
- [STAGING.md](STAGING.md) — public staging workflow and private-runbook pointer
- [PRODUCTION.md](PRODUCTION.md) — public production workflow and
  private-runbook pointer
- [`crm-ops/deploy/CLOUD-OPS.md`](https://github.com/SpeculativeTechnologies/crm-ops/blob/main/deploy/CLOUD-OPS.md)
  — authoritative cloud operations, recovery, and rollback

## Once a week, automatically

A job opens a PR every Monday morning bringing in changes from the upstream
Twenty project. It's usually 100–200 commits. Treat it like any other PR:
review, stage, test, merge. **Merge it the week it opens** — letting it pile up
makes the next one bigger and more likely to conflict with our own changes.
