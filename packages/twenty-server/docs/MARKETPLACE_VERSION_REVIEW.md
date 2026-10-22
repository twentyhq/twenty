# Marketplace version review in app owner workspaces

> **Work in progress — implementation proposal.** This document specifies the
> pipeline; it does not enable review agents or marketplace enforcement. The
> requirements and process may evolve before launch.
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
   Persist the app/version IDs, artifact hash, source commit, provenance
   verification, owner workspace, official run/thread IDs, policy/checklist and
   agent configuration versions, model, findings, and completion status in a core
   review record. Include scan and test results, coverage, tested Twenty version
   and configuration, and changes since the previous vetted version. Display a
   copy in the owner workspace.
5. **Make a human decision.** A Twenty reviewer checks security findings and the
   functionality, UX, permission, entity-footprint, and scaling evidence. Record a
   result and evidence for every applicable public criterion; non-applicability
   needs a written reason. Only an authorized Twenty approver can mark that exact
   artifact vetted, with their name, decision, and date recorded. The reviewer
   may also be the approver in V1. Security blockers cannot be waived; product
   quality cannot compensate for a failed security review.

## Internal security gates

The publisher-facing checklist requires compliance with Twenty's internal
security review. Keep the technical checks here for the review agent and human
reviewers; removing attack lists from the public page does not remove these gates.

- **Artifact and behavior.** Verify identity, provenance, and source against the
  retained package. Inspect frontend code, logic functions, hooks, jobs, AI
  instructions, dependencies, and lifecycle scripts for credential theft,
  undeclared collection, backdoors, destructive actions, sandbox escapes,
  concealed execution, and attempts to evade review.
- **Untrusted input.** Check query, command, code, HTML, and template injection,
  XSS, path traversal, and SSRF. Verify input validation, protection of internal
  services and cloud metadata, webhook authentication, and applicable replay
  protection.
- **Authorization and isolation.** Verify least privilege for app and agent roles
  and external OAuth scopes. Test user-triggered and application-identity calls
  with different roles and at least two workspaces. Check records, credentials,
  caches, jobs, and routing; unverified input must not select a target workspace.
- **AI behavior.** For AI apps, test whether malicious records or external content
  cause unauthorized tool calls, disclosure, or destructive actions. Verify that
  authorization is enforced outside the model.
- **Data and dependencies.** Verify declared destinations and data flows, secret
  storage, HTTPS, retention/deletion, and logging. Scan direct, transitive,
  bundled, and runtime dependencies for vulnerabilities and malicious packages.
  Check deterministic resolution and unreviewed code or remote instructions
  introduced after approval. Secrets must not appear in source, frontend bundles,
  ordinary storage, or logs; the key-value store holds plain JSON. Material
  changes to hosted behavior or remote instructions require re-review.

Reject confirmed malicious behavior. Block approval for confirmed high/critical
vulnerabilities, exploitable authorization or isolation failures, unexplained
data transfers, and unresolved suspicious behavior. Incomplete scans or missing
evidence cannot pass. Document false positives and non-applicability; give
lower-severity findings an explicit disposition and, where remediation is
required, an owner and target date.

## Functional and operational review

Use the public checklist as the acceptance criteria; keep test procedures here.

- Run lifecycle and core-flow tests through real package installation, including
  hooks. Development sync skips hooks, and a synchronous post-install failure
  does not roll back schema changes. Test upgrades from the previous vetted
  version when available, duplicate-side-effect prevention, and uninstall cleanup.
- Review entity inventories and additions in updates for necessity. There is no
  fixed entity-count maximum in V1.
- Check the publisher's API/job estimate at the expected installation scale and
  burst/retry test against shared limits. Verify batching, pacing, and recovery
  for the capabilities the app uses.
- For shared routes, test the configured owner installation and delivery to a
  second installed workspace. Verify that the publisher documents the owner
  installation's availability and maintenance.

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

## Approval and enforcement

Record each submitted version as **pending** until a human decision is made:
**vetted**, **changes required**, or **rejected**. Use **revoked** when a previously
vetted version no longer meets the requirements.

Before piloting third-party vetting, implement these installation and review gates:

- Install the approved artifact and verify its hash; a mutable npm tag cannot
  identify an approval. Existing app-level `isVetted` is insufficient.
- Keep the previous vetted version available while its replacement is reviewed.
  Existing installations must not automatically move to an unvetted version.
- Require renewed administrator consent for expanded permissions or data access.
- Re-scan retained versions when new vulnerability information appears.
- On revocation, block new installs/upgrades and support containment of affected
  installations. Removing a badge alone is insufficient for known malicious code.

Published community apps and vetted versions remain distinct. Twenty currently
rejects app downgrades, so recovery must use containment and a vetted corrective
release rather than promise an automatic rollback.

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

