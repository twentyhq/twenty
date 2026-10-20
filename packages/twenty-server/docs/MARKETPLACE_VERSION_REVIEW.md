# Marketplace version review in app owner workspaces

> **Work in progress — implementation proposal.** This document specifies the
> pipeline; it does not enable review agents or marketplace enforcement.
> The publisher-facing checklist is proposed in
> [twenty#28457](https://github.com/twentyhq/twenty/pull/28457), for
> [core-team-issues#2974](https://github.com/twentyhq/core-team-issues/issues/2974).

## V1 decision

Run the security review agent in each submitted app's registered owner workspace
(`ApplicationRegistrationEntity.ownerWorkspaceId`). Reuse Twenty's agent runtime
and conversations so publishers can inspect findings where they manage their app.
Twenty controls the reviewer and the approval decision.

Use one security agent per owner workspace, with a fresh run for each version and
review attempt. Do not create an agent per version or run reviews in every
customer workspace. Functional tests execute in disposable test workspaces.

## Flow

1. **Record and freeze the submission.** Observe every published version and create
   a pending review against `applicationRegistrationVersion.id`. A platform job
   fetches the exact artifact, verifies package and app identity, hashes the bytes,
   and retains them with the source commit and dependency lockfile. Do not resolve
   `latest` during review or trust a publisher-supplied hash without verification.
2. **Start an official run.** Resolve ownership from the registration, then enqueue
   a run in that workspace using a Twenty-controlled agent, policy, model
   configuration, and restricted role. Store the attempt ID and configuration
   digest centrally before starting. Use a fresh conversation; publisher messages
   and previous conversations cannot become review instructions.
3. **Inspect the full artifact.** Supply read-only, bounded access to its file
   inventory, readable source, manifest, dependency and secret scan evidence,
   declared destinations, and permission/entity inventory. Include the diff from
   the previous vetted version, but cover the complete new artifact. Report
   malicious behavior, injections, authorization/isolation failures, data
   exfiltration, hidden execution, and suspicious dependencies with file/line
   evidence. Missing or uninspectable content prevents a completed review.
4. **Collect evidence.** Accept results only from the platform-started attempt.
   Persist the artifact hash, owner workspace, official run/thread IDs, policy and
   agent configuration versions, model, scan coverage, findings, and completion
   status in a core review record. Display a copy in the owner workspace.
5. **Make a human decision.** A Twenty reviewer checks security findings and the
   functionality, UX, permission, entity-footprint, and scaling evidence. Only an
   authorized Twenty approver can mark that exact artifact vetted. Confirmed
   malicious behavior is rejected; blockers or missing evidence remain unvetted.

## Trust boundaries

| Boundary | V1 requirement |
| --- | --- |
| Publisher → reviewer | The publisher cannot choose or modify the official prompt, model configuration, role, tool set, or policy. App source, comments, READMEs, prompts, and test output are untrusted evidence. Instructions embedded in them have no authority. |
| Agent → workspace | No CRM access, workspace secrets, general HTTP/browser access, arbitrary shell execution, or tools belonging to the submitted app. Only submission-bound read tools and fixed scan operations. Enforce this in tool authorization, not just the prompt. |
| Agent → approval | The agent produces findings only. It has no permission to vet versions, change findings' dispositions, or call approval endpoints. |
| Owner workspace → core | A conversation, custom record, API request, or uploaded report from the publisher is not an attestation. Accept only the expected internal completion for the recorded attempt and artifact. Workspace admins must not be able to rewrite authoritative evidence. |
| Submitted code → runtime | Build scripts, hooks, dependencies, and functional tests run in separate disposable isolation with synthetic data, no production credentials, restricted egress, and resource limits. The owner workspace is the agent's operating context, not a sandbox for malicious code. |

Validate the trusted agent configuration and effective tool permissions before
each official run and continuation. If they differ from the pinned policy, stop
the attempt. App ownership alone is not proof that metadata cannot be changed.
Protect the configuration through the supported mutation paths and test this.

Do not accept a claimed successful run from a publisher-controlled/self-hosted
server as evidence for Twenty's official marketplace. Such a submission needs a
run whose execution and result Twenty can independently control and verify.

## Reliability and state

Keep processing state separate from the approval decision. A completed agent run
means evidence is ready for review; it never means vetted.

- Deduplicate attempts by version ID, artifact hash, and policy version. Use a
  persisted job/outbox or reconciliation so transaction rollbacks, queue failures,
  and duplicate publication notifications cannot lose or multiply reviews.
- Apply per-workspace concurrency and spending limits, bounded retries, and a
  timeout. Use the existing AI quota checks; quota exhaustion is an incomplete
  review, not a passing result. Record an explicit reason and allow retry.
- Reconcile all published npm versions; observing only the moving `latest` tag
  can miss intermediate releases. Archive uploads use the same review path.
- Missing/unverified ownership, unavailable agents, a changed owner, deleted
  workspaces, missing artifacts, and interrupted scans leave the version unvetted.
  Reject stale completions after an attempt is superseded or ownership changes.
- Preserve previous evidence when retrying. Record findings' dispositions and the
  approver identity/date separately from the agent's output.

Before third-party vetting goes live, marketplace installs and upgrades must
select an approved version and verify its artifact hash. Retain the previous
vetted version while a new release is pending. Revocation must block new
installs/upgrades and support containment of affected installations. Existing
app-level `isVetted` is not sufficient to enforce these rules.

## Existing components and required wiring

The repository already has:

- [Version records](../src/engine/core-modules/application/application-registration-version/application-registration-version.service.ts)
  and [registration ownership](../src/engine/core-modules/application/application-registration/application-registration.entity.ts).
- [Native agent execution](../src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service.ts),
  [caller handlers](../src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type.ts),
  and [tool authorization](../src/engine/metadata-modules/ai/ai-agent-execution/services/agent-toolset.service.ts).
- [App-defined agents and roles](../../twenty-docs/developers/extend/apps/logic/skills-and-agents.mdx).
  The public `runAgent` API accepts caller instructions and output overrides; a
  successful public run alone must not qualify as the official review.

Implement a platform-owned caller for official reviews, protected agent
provisioning, immutable artifact/evidence storage, safe artifact inspection tools,
scan/test execution, publication reconciliation, and the approval/enforcement
paths. The existing primitives do not yet provide those guarantees.

[Deepsec in twenty-factory](https://github.com/twentyhq/twenty-factory/blob/main/.github/workflows/deepsec-scan.yml)
is an existing security scanner to evaluate as a bounded analysis tool. Its
current workflow scans Twenty framework code. It does not already review
published third-party packages, and its workflow credentials must not be exposed
to agents or submissions. GitHub Actions is not the owner-workspace orchestrator
in this proposal.

## Acceptance checks before enabling V1

- A newly recorded npm or archive version starts one official review in the
  registered owner workspace, including after queue failure and reconciliation.
- A malicious README cannot access workspace data, invoke app tools or outbound
  requests, alter the review policy, or cause approval.
- Editing agent metadata/roles, injecting a public `runAgent` result, replaying a
  completion, or changing the workspace report cannot alter authoritative
  evidence or vetting. Ownership changes invalidate in-flight attempts.
- Truncated files, skipped scans, unavailable dependencies, timeouts, quota
  exhaustion, and unresolved security blockers cannot produce a vetted version.
- The approved artifact is the one installed; new releases and expanded
  permissions cannot silently inherit previous approval.

Start with one security agent and a human checklist. Additional specialist agents,
automatic approval, certification tiers, and broad performance certification are
outside V1.
