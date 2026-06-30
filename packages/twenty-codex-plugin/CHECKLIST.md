# Twenty Codex Plugin — Best Practices Compliance Checklist

This file is the authoritative compliance matrix. Every row maps an official requirement (Codex build guide, Codex best-practices guide, or OpenAI reference implementation) to either an **automated** check (a `scripts/validate.js` assertion function) or a **manual** sign-off.

A release is shippable when:
1. `yarn workspace twenty-codex-plugin validate` exits 0 (all `[automated]` rows green).
2. Every `[manual]` row has a current sign-off date.

## Sources of Truth

- **Codex Plugin Build Guide** — https://developers.openai.com/codex/plugins/build
- **Codex Best Practices** — https://developers.openai.com/codex/learn/best-practices
- **Reference Implementation** — https://github.com/openai/codex-plugin-cc

## Plugin Manifest (`.codex-plugin/plugin.json`)

| # | Requirement | Source | Check |
|---|---|---|---|
| M1 | `name` present, kebab-case, lowercase | Build guide §Naming | [automated] `assertJsonMetadata` |
| M2 | `version` follows SemVer and matches `package.json` | Build guide §Manifest | [automated] `assertJsonMetadata` |
| M3 | `description` present and concise | Build guide §Required fields | [automated] `assertInterfaceFields` (planned) |
| M4 | `mcpServers` points at `./.mcp.json` | Build guide §MCP | [automated] `assertJsonMetadata` |
| M5 | `skills` points at `./skills/` | Build guide §Skills | [automated] `assertJsonMetadata` |
| M6 | `interface.displayName` present and non-empty | Build guide §Interface | [automated] `assertInterfaceFields` (planned) |
| M7 | `interface.shortDescription` ≤ 64 chars | Build guide §Marketplace | [automated] `assertInterfaceFields` (planned) |
| M8 | `interface.longDescription` present, multi-sentence | Build guide §Marketplace | [automated] `assertInterfaceFields` (planned) |
| M9 | `interface.category` matches marketplace enum (`Coding`) | Build guide §Marketplace | [automated] `assertInterfaceFields` (planned) |
| M10 | `interface.capabilities` non-empty subset of `Interactive,Read,Write` | Build guide §Capabilities | [automated] `assertInterfaceFields` (planned) |
| M11 | `interface.websiteURL`, `privacyPolicyURL`, `termsOfServiceURL` present | Build guide §Publisher links | [automated] `assertInterfaceFields` (planned) |
| M12 | `interface.brandColor` matches `#RRGGBB` and reflects Twenty brand | Build guide §Marketplace | [automated] `assertInterfaceFields` (planned), [manual] brand alignment |
| M13 | `interface.defaultPrompt` is a non-empty array of strings | Build guide §Defaults | [automated] `assertInterfaceFields` (planned) |
| M14 | All manifest paths start with `./` and stay within plugin root | Build guide §Paths | [automated] `assertJsonMetadata` |

## Assets (`assets/`)

| # | Requirement | Source | Check |
|---|---|---|---|
| A1 | `interface.logo` exists and is PNG | Build guide §Assets | [automated] `assertAssets` (planned) |
| A2 | Logo PNG is ≥ 256×256 | Build guide §Assets | [automated] `assertAssets` (planned, PNG IHDR parse) |
| A3 | `interface.composerIcon` exists and is valid SVG or PNG | Build guide §Assets | [automated] `assertAssets` (planned) |
| A4 | `interface.screenshots` has ≥ 1 entry | Build guide §Assets | [automated] `assertAssets` (planned) |
| A5 | Every screenshot path exists and is PNG | Build guide §Assets | [automated] `assertAssets` (planned) |
| A6 | Screenshots show the plugin in action (not placeholder mocks) | Build guide §Marketplace | [manual] reviewer sign-off |

## Skills (`skills/<name>/SKILL.md`)

| # | Requirement | Source | Check |
|---|---|---|---|
| S1 | Canonical five skills present | Internal convention | [automated] `assertSkills` |
| S2 | No legacy skill names anywhere | Internal convention | [automated] `assertNoLegacySkillReferences` |
| S3 | Each `SKILL.md` has YAML frontmatter with `name` + `description` only | Build guide §Skills | [automated] `assertSkills` |
| S4 | Frontmatter `name` matches directory | Build guide §Skills | [automated] `assertSkills` |
| S5 | Each skill has `agents/openai.yaml` with `display_name`, `short_description` (≤64), `default_prompt` (mentions `$<skill>`) | OpenAI Agent format | [automated] `assertSkills` |
| S6 | Each skill is scoped to a single job with clear boundaries | Best practices §Skill scope | [manual] cross-skill audit |
| S7 | Each skill includes a `## When to use` trigger-phrase section | Best practices §Descriptions | [automated] `assertSkillTriggerPhrases` (planned) |
| S8 | Descriptions are disjoint across skills (no routing collision) | Best practices §Descriptions | [manual] cross-skill audit |

## References (`references/`)

| # | Requirement | Source | Check |
|---|---|---|---|
| R1 | All required reference files exist | Internal convention | [automated] `assertReferences` |
| R2 | `use-twenty-mcp` formatting contract intact across SKILL.md and result-formatting.md | Internal convention | [automated] `assertTwentyMcpFormattingContract` |
| R3 | Front component guidance correctly split across develop-app skill, layout.md, front-components.md, standalone-pages.md, app-structure.md, front-component-ui.md | Internal convention | [automated] `assertFrontComponentGuidance` |
| R4 | CLI guidance correctly split between develop-app and manage-app | Internal convention | [automated] `assertCliGuidanceSplit` |
| R5 | `concepts/how-apps-work.md` is foundational and linked from every skill | Internal convention | [automated] `assertHowAppsWork` |

## MCP (`.mcp.json` and `scripts/setup-mcp.sh`)

| # | Requirement | Source | Check |
|---|---|---|---|
| MCP1 | `.mcp.json` declares only the public `twenty-docs` server | Internal convention | [automated] `assertJsonMetadata` |
| MCP2 | No workspace-specific MCP configs bundled anywhere | Internal convention | [automated] `assertNoBundledMcpConfig` |
| MCP3 | No bearer tokens or API keys anywhere in the package | Build guide §Security | [automated] `assertNoBundledMcpConfig` |
| MCP4 | No non-placeholder URLs in any file | Internal convention | [automated] `assertNoBundledMcpConfig` |
| MCP5 | `scripts/setup-mcp.sh` passes `bash -n` syntax check | Internal convention | [automated] `assertSetupHelper` |
| MCP6 | `setup-mcp.sh` correctly normalizes representative URLs | Internal convention | [automated] `assertSetupHelper` |

## Marketplace & Distribution

| # | Requirement | Source | Check |
|---|---|---|---|
| D1 | `templates/marketplace.example.json` matches plugin name/version | Internal convention | [automated] `assertMarketplaceTemplate` (planned) |
| D2 | Optional repo-level `.agents/plugins/marketplace.json` points at `./packages/twenty-codex-plugin` | Build guide §Distribution | [automated] `assertJsonMetadata` |
| D3 | `CHANGELOG.md` updated for every version bump | Reference impl | [manual] release reviewer sign-off |

## Process

| # | Requirement | Source | Check |
|---|---|---|---|
| P1 | `validate.js` runs in CI on every PR touching the plugin | Reference impl | [manual] confirm `.github/workflows/ci-codex-plugin.yml` is active |
| P2 | `validate.js` has its own unit tests | Internal convention | [manual] confirm `scripts/__tests__/` exists and runs |
| P3 | Version bump procedure documented | Internal convention | [manual] confirm `CONTRIBUTING.md` covers it |

## Manual Sign-off Log

When a manual row above is verified, add a line here.

| Date | Row(s) | Reviewer | Notes |
|---|---|---|---|
| 2026-05-28 | S6, S8 | Codex plugin compliance pass | Skill descriptions reviewed side-by-side; "When To Use" sections added to all five SKILL.md files with explicit "do not use this skill for X" boundary callouts referencing the four siblings. Routing surface is disjoint. |
| 2026-05-28 | M12 | Codex plugin compliance pass | `brandColor: #000000` matches the actual logo background in `assets/twenty-logo.svg`. |

## Deferred Items

Tracked for a follow-up PR; not blocking the current release.

| Item | Reason for deferral |
|---|---|
| Real marketplace screenshots (A4, A5, A6) | Requires real captures against a demo workspace. `assets/screenshots/README.md` documents what's needed; `plugin.json` `screenshots` stays `[]` until the PNGs land so `assertAssets` does not regress. |
| Splitting `standalone-pages.md` / `front-component-ui.md` | The cross-doc contracts assert dozens of exact fragments per file. The mechanical risk of fragment drift outweighs the readability gain at current size (~450 lines each). Re-evaluate when either exceeds 600 lines. |
| `hooks/hooks.json` SessionStart hook | The Codex hook schema for plugin-bundled hooks needs deeper validation; a misconfigured `SessionStart` hook would fire on every Codex session. Add only when the format is verified against a working reference implementation. |
