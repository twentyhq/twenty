# Environment guide

The old workflow in this file mixed local development with the live backend.
That workflow is retired because both processes could use the production
Postgres and Redis services.

Use the environment-specific guides:

- [DEVELOPMENT.md](DEVELOPMENT.md): development on another machine
- [STAGING.md](STAGING.md): isolated staging on this production Mac
- [PRODUCTION.md](PRODUCTION.md): operation of the live instance
- [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md): branching, review, and promotion protocol

Do not run development setup, source backend processes, tests, or reset commands
on the production Mac.
