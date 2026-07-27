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
| **Staging** | A copy of the real CRM, refreshed from production every morning. Safe to break. |
| **Production** | The live CRM everyone uses |

Staging and production both live on one Mac in the office. That Mac never
accepts incoming connections — it checks GitHub every minute or two and pulls
down whatever it's been told to run. That's why you don't need server access,
and it's why a deploy takes a minute to show up rather than being instant.

Two invisible bookmarks control it: one says what staging should run, the other
says what production should run. Deploying is just moving a bookmark.

## The normal path

**1. Build it.** Branch off `main`, make your change, push, open a PR.

**2. Wait for CI.** The check is called `ci-fork-status-check`. Get it green.
Get a review.

**3. Put it on staging.** Add the label `needs-staging` to your PR. That builds
an image — takes 20–40 minutes, so add the label early. Then go to
**Actions → Deploy to staging → Run workflow** and enter your branch name.

**4. Actually try it.** Open staging and use the thing you changed. Click around
the normal stuff too — people, companies, search. Staging has real data in it,
so it should feel like the real CRM.

**5. Merge your PR.**

**6. Put it on production.** Go to **Actions → Deploy to production → Run
workflow** and type `main`. The run then pauses and waits for Ben to approve it.
Once approved, the Mac picks it up within a minute.

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

For production, watch for the deploy to report success in the Actions run, or
ask someone with server access to check the log. The line you want ends with
`production is now running <commit> and healthy`.

A deploy that changes the database takes a backup first and runs migrations, so
it can take several minutes. A deploy that only touches a few files takes
seconds.

## If something looks wrong

**Don't re-run the deploy to try again.** Once the Mac has moved to the new
code, running it again does nothing — it thinks it's already done. Re-running
never fixes a half-finished deploy.

Instead:

- If the site is up but looks stale or broken after a big update, the frontend
  may need rebuilding — see [PRODUCTION.md](PRODUCTION.md).
- If a database migration failed, **stop and get Ben.** Rolling back the code
  does not undo a database change, and guessing here can lose data.
- Backups run nightly, plus one before every database-changing deploy.

## Where the detail lives

- [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md) — the rules, review requirements, and
  what counts as an emergency change
- [DEVELOPMENT.md](DEVELOPMENT.md) — setting up your own machine
- [STAGING.md](STAGING.md) — staging internals, refreshing its data
- [PRODUCTION.md](PRODUCTION.md) — live operations, recovery, rollback

## Once a week, automatically

A job opens a PR every Monday morning bringing in changes from the upstream
Twenty project. It's usually 100–200 commits. Treat it like any other PR:
review, stage, test, merge. **Merge it the week it opens** — letting it pile up
makes the next one bigger and more likely to conflict with our own changes.
