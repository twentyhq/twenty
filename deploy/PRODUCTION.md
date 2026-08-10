# Cloud production

Production runs on Google Cloud and is available to authorized users at
`https://crm.spec.tech`. It no longer runs from a source checkout on Ben's Mac.

## Promotion boundary

Production is deployed only through **Deploy to production** in GitHub Actions.
The workflow:

1. resolves the requested ref to an exact commit SHA;
2. refuses commits that are not on `main`;
3. refuses commits that do not contain what staging last ran;
4. waits for the production approval gate; and
5. deploys the pinned cloud image and waits for the result.

Developers and coding agents must not push directly to `main`, bypass the
workflow, operate the production VM, or improvise database repair.

## Operational boundary

The private
[`SpeculativeTechnologies/crm-ops`](https://github.com/SpeculativeTechnologies/crm-ops)
repository is the source of truth for the live Compose stack, deployment and
backup scripts, Cloudflare ingress, access, health checks, restores, incidents,
and rollback. Start with
[`deploy/CLOUD-OPS.md`](https://github.com/SpeculativeTechnologies/crm-ops/blob/main/deploy/CLOUD-OPS.md).

Do not use `deploy/production-converge.sh`, `deploy/serve-public.sh`, the launchd
files, or the former `/Users/ben/Deploy/twenty` checkout to operate production.
They describe the retired Mac-hosted deployment.
