---
name: test-changed
description: >
  Run Jest tests for files that have been changed (staged, unstaged, or both).
  Automatically finds related test files and uses the correct Jest config for
  each Twenty package. Invoke with /test-changed.
user-invocable: true
allowed-tools: Bash(git:*), Bash(npx:*), Bash(cd:*), Bash(find:*), Bash(ls:*)
---

# test-changed

Run Jest tests covering all recently changed files in the Twenty monorepo.

## Steps

1. **Find changed files** — run both commands to get full picture:
   ```bash
   git -C /home/clive/_Projects/stratum/twenty/source diff --name-only HEAD
   git -C /home/clive/_Projects/stratum/twenty/source diff --name-only --cached
   ```
   Deduplicate. Ignore deleted files (check they still exist). Ignore non-source files (`.md`, `.json`, `.yml`, lock files).

2. **Group by package** — map each path to its package:
   - `packages/twenty-front/...` → config `packages/twenty-front/jest.config.mjs`, run from `packages/twenty-front/`
   - `packages/twenty-server/...` → config `packages/twenty-server/jest.config.mjs`, run from `packages/twenty-server/`
   - Other packages → use their own `jest.config.mjs` if present

3. **Resolve test files** — for each changed source file:
   - If the file IS a test file (path contains `__tests__` or filename ends in `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx`), use it directly.
   - Otherwise, look for a corresponding test file:
     - Check `<dir>/__tests__/<basename>.test.ts(x)`
     - Check `<dir>/__tests__/<basename>.spec.ts(x)`
     - Check sibling `<basename>.test.ts(x)`
   - If no test file found, note it but don't fail.

4. **Run tests** — for each package that has test files to run:
   ```bash
   cd /home/clive/_Projects/stratum/twenty/source/packages/<package> && \
     npx jest <space-separated test file paths relative to package root> --config=jest.config.mjs --no-coverage
   ```
   Run packages sequentially (not in parallel) to avoid output interleaving.

5. **Report** — summarise: which files changed, which tests ran, pass/fail counts. If any source file had no corresponding test, mention it so the user knows coverage may be incomplete.

## Notes

- The git repo root is `/home/clive/_Projects/stratum/twenty/source/`
- If the user provides arguments (e.g. `/test-changed --staged-only`), honour them:
  - `--staged-only` — only `git diff --cached`
  - `--unstaged-only` — only `git diff` (not cached)
  - `--all` — include untracked files too (use `git status --porcelain`)
- If no changed files are found, say so and exit cleanly.
