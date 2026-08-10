# Environment guide

The old workflow in this file mixed local development with a live backend. It
is retired.

Use the current guides:

- [DEVELOPMENT.md](DEVELOPMENT.md): isolated development in the public CRM repo
- [STAGING.md](STAGING.md): staging promotion boundary
- [PRODUCTION.md](PRODUCTION.md): production promotion boundary
- [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md): branching, review, and promotion protocol
- [`crm-ops/deploy/CLOUD-OPS.md`](https://github.com/SpeculativeTechnologies/crm-ops/blob/main/deploy/CLOUD-OPS.md):
  private cloud operations and incident response

Do not run development setup, source processes, tests, or reset commands on a
staging or production cloud VM.
