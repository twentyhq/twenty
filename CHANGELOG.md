# Changelog -- CCG Central Enterprise CRM

All notable changes on the `feature/enterprise-modules` branch.

> **Note**: This changelog was generated from the most recent commits visible in the branch history. Run `git log --oneline feature/enterprise-modules --not main` for the complete list.

## 2026-04-29

### Recent Commits

- **d0a64ac765** -- `refactor(ui): split Button.tsx (555->201 lines) extract types + compute functions`
  Refactored the Button component to comply with the 300-line limit. Extracted type definitions and compute functions into separate files.

- **b421684eca** -- `docs: add Podman ADR and update README with build notes`
  Added Architecture Decision Record for Podman deployment support. Updated README with build instructions for Podman-based container deployments.

- **a1de503151** -- `Enable default feature flags`
  Enabled enterprise module feature flags by default for development and testing. Covers all 31 module flags and 7 fiscal country flags in `FeatureFlagKey.ts`.

- **232e1e795f** -- `chore: snapshot workspace changes`
  Checkpoint commit capturing workspace-wide changes across frontend and backend packages.

- **66179ffb2e** -- `feat(sales-execution,cs,cpq): add Sales Execution, Customer Success, CPQ modules`
  Added three core enterprise modules:
  - **Sales Execution**: Territory management, quota tracking, deal blueprints, stage validation
  - **Customer Success**: Health scoring, NPS surveys, playbooks, QBR management, expansion revenue
  - **CPQ**: Price books, product pricing, quote generation, line items, approval workflow

---

## Branch Overview

**Branch**: `feature/enterprise-modules`
**Base**: `main`
**Status**: Active development

### What This Branch Contains

This branch is the main development branch for CCG Central's enterprise CRM platform. It includes:

1. **42+ Enterprise Modules** -- Full-stack NestJS modules covering sales, service, finance, operations, HR, marketing, communications, and AI
2. **SaaS Platform Layer** -- Multi-tenant provisioning, module activation, billing calculation, event bus
3. **LATAM Fiscal Compliance** -- Electronic invoicing for 7 countries (Colombia DIAN, Mexico SAT, Dominican Republic DGII, Chile SII, Peru SUNAT, Argentina AFIP, Brazil NF-e)
4. **AI/LLM Integration** -- Multi-provider LLM client (OpenAI, Anthropic, Google), AI governance, 8 specialized AI agents
5. **VoIP Integration** -- Asterisk PBX with SIP, ARI, call logging, IVR, auto-dialer
6. **Infrastructure** -- Docker Compose production stack, Nginx API gateway, rate limiting
7. **Frontend** -- 20 settings pages for enterprise module configuration
8. **Feature Flags** -- 59 feature flags for granular module activation per workspace

### Modified Files (from git status)

**Backend**:
- `backend/twenty-server/project.json` -- Nx project configuration
- `backend/twenty-server/src/engine/core-modules/sso/workspace-sso.entity.ts` -- SSO entity updates

**Frontend (twenty-front)**:
- `frontend/twenty-front/package.json` -- Dependencies
- `frontend/twenty-front/src/modules/apollo/utils/getTokenPair.ts` -- Token handling
- `frontend/twenty-front/src/modules/app/components/AppRouterProviders.tsx` -- Router setup
- `frontend/twenty-front/src/modules/object-record/advanced-filter/hooks/` -- Filter hooks
- `frontend/twenty-front/src/modules/ui/theme/` -- Theme provider and color scheme
- `frontend/twenty-front/src/pages/settings/profile/appearance/` -- Settings UI

**Frontend (packages/twenty-front)** -- Mirror of the above changes

**Infrastructure**:
- `packages/twenty-docker/podman/` -- Podman deployment support
- `packages/twenty-docker/twenty/Dockerfile` -- Container build configuration

**Shared**:
- `packages/twenty-shared/src/types/FeatureFlagKey.ts` -- 59 feature flags (implied by module additions)
