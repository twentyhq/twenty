# Agent Instructions


This project uses **multica** for issue tracking and project management.

## Quick Reference

```bash
multica issue create --workspace-id d11337e4 --title "..." --priority medium
multica --profile desktop-api.multica.ai issue list --limit 10
multica --profile desktop-api.multica.ai ready
```

The x0-pure workspace is `d11337e4-0c4e-43b8-8fc8-8216c70f1427`.
The Ticketing project is `fb2e3c0e-27e0-47ac-b86d-3d2e18832fd6`.

## Non-Interactive Shell Commands

**ALWAYS use non-interactive flags** with file operations to avoid hanging on confirmation prompts.

Shell commands like `cp`, `mv`, and `rm` may be aliased to include `-i` (interactive) mode on some systems, causing the agent to hang indefinitely waiting for y/n input.

**Use these forms instead:**
```bash
# Force overwrite without prompting
cp -f source dest           # NOT: cp source dest
mv -f source dest           # NOT: mv source dest
rm -f file                  # NOT: rm file

# For recursive operations
rm -rf directory            # NOT: rm -r directory
cp -rf source dest          # NOT: cp -r source dest
```

**Other commands that may prompt:**


- `scp` - use `-o BatchMode=yes` for non-interactive
- `ssh` - use `-o BatchMode=yes` to fail instead of prompting
- `apt-get` - use `-y` flag
- `brew` - use `HOMEBREW_NO_AUTO_UPDATE=1` env var

## Deployment Pipeline — CANONICAL

```
local dev ──→ twenty pod stack ──→ (manual verify) ──→ michael_crm ──→ (manual gate) ──→ prod
  (workstation)  (podman sandbox)                                     (Railway)                    (crm.xopure.com)
```

**NEVER deploy to Railway without explicit human approval.** All deploys past the pod
stack require a manual gate. Auto-deploy is OFF for every Railway service. `michael_crm`
is the sole agent-accessible target, and only after pod-stack verification passes.
Production (`Xopure_crm`, `crm-v2`) is NEVER touched by automated or agent-triggered
deployment.

Full pipeline: see `skill://x0-pure-deployment`.








## Session Completion
Full pipeline: see `skill://x0-pure-deployment`.

## Session Completion
Full pipeline: see `skill://x0-pure-deployment`.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below.
Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
