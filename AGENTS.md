# Instructions for Codex (OpenAI)

## Project Context
- Self-hosted Twenty CRM on Docker Compose
- Repository: https://github.com/pawelpmcc/TwentyCRM_SM
- DEV environment: https://toniedevcrm.salesmasters.pl (Hetzner VPS CX22)
- Production: separate dedicated Hetzner servers (DO NOT TOUCH!)

## Owner Profile
- Business owner, NOT a developer
- Needs clear explanations of what we're doing and why
- Uses Claude Code and Codex (OpenAI) for coding tasks
- Language: Polish (commands and code can be in English)

## Rules
- NEVER commit .env files with secrets
- Always work on feature/* or develop branch, NEVER on main
- Every change needs a description of what and why
- After significant changes — update docs/CHANGELOG.md
- Before push, verify no secrets: git diff --cached --name-only | grep -E '\.env$'
- Comments in code: Polish or English

## Tech Stack
- Twenty CRM (self-hosted via Docker Compose)
- PostgreSQL 16 (database)
- Redis (cache)
- Nginx (reverse proxy + SSL)
- Node.js 22 LTS + Yarn
- Ubuntu 24.04 LTS

## Infrastructure
- DEV: Hetzner VPS CX22 (2 vCPU, 4GB RAM) — all-in-one server
- PROD: Server 1 = app, Server 2 = database, Backup = Hetzner Storage Box
- DO NOT touch production servers!

## Key Files
- docker-compose.yml — container configuration
- .env — environment variables (DO NOT COMMIT!)
- .env.example — variable template (this one we commit)
- docs/SPEC.md — business spec (lead statuses, deduplication)
- docs/CHANGELOG.md — change log

## Branching Strategy
- main — stable (production)
- develop — current development
- feature/* — new features
- hotfix/* — urgent fixes

## Commit Convention
- Format: type: short description
- Types: feat, fix, docs, chore, refactor
- Example: feat: add lead status workflow

## Docker Commands
```bash
docker compose up -d          # Start
docker compose down            # Stop
docker compose ps              # Status
docker compose logs -f         # Live logs
docker compose restart server  # Restart single container
```
