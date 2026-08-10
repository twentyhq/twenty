# Retired deploy-host instructions

The Mac-hosted staging and production model described by the former version of
this file was retired in August 2026. Its launchd convergers, Tailscale staging
endpoint, native production processes, and production source checkout must not
be used to operate the current CRM.

Staging and production now run on separate Google Cloud VMs. Coding agents do
not operate either environment directly and do not initiate deployments on
their own initiative.

For current guidance:

- local development and PR handoff: [LLM-LOCAL-DEV.md](LLM-LOCAL-DEV.md)
- team workflow: [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md)
- cloud deployment, access, backup, restore, and incident response: private
  [`SpeculativeTechnologies/crm-ops`](https://github.com/SpeculativeTechnologies/crm-ops),
  starting with
  [`deploy/CLOUD-OPS.md`](https://github.com/SpeculativeTechnologies/crm-ops/blob/main/deploy/CLOUD-OPS.md)
