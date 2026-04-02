---
name: customization-tracking
description: Track Omnia-specific customizations in CUSTOMIZATIONS.md and check-customizations.sh. Use when modifying upstream files, adding new Omnia code, or finishing any feature that touches files shared with upstream twentyhq/twenty.
---

# Customization Tracking

**Purpose**: Every Omnia change that touches upstream files or adds new modules must be tracked in two places so upstream merges don't silently overwrite our work.

**When to use**: As the **final step** of any feature or bug fix that modifies upstream files or adds new Omnia-specific files. This is a non-negotiable — CI will catch missing entries.

---

## The Two Files

### 1. `CUSTOMIZATIONS.md` — Human-readable changelog

Documents **what** we changed, **which file**, and **why**.

### 2. `scripts/check-customizations.sh` — Machine-verifiable checks

Asserts that customizations survive upstream merges. Run with:

```bash
./scripts/check-customizations.sh
```

---

## Decision Tree: Which Check Function?

### `check_file_contains` — Modified upstream file

Use when you **changed or added code** to an upstream file. Pick a short, stable grep pattern that proves the customization is present.

```bash
check_file_contains \
  "packages/twenty-front/src/modules/navigation/components/MainNavigationDrawer.tsx" \
  'label={t`Search`}' \
  "Search item should remain in the sidebar"
```

**Choosing a good pattern:**
- Pick a string unique to the customization (a variable name, comment marker, or function call that upstream doesn't have)
- Avoid patterns that match boilerplate upstream might also have
- Use `OMNIA-CUSTOM` comment markers in code when the change is small and easy to miss

### `check_file_not_contains` — Removed upstream code

Use when you **removed something** from an upstream file (a feature gate, a UI element, an import).

```bash
check_file_not_contains \
  "packages/twenty-front/src/modules/settings/roles/.../SettingsRolePermissionsObjectLevelObjectForm.tsx" \
  "isRLSBillingEntitlementEnabled" \
  "Organization plan gate should be removed — RLS always enabled"
```

### `check_file_exists` — New Omnia file

Use when you **created a new file** that doesn't exist upstream. Applies to custom modules, utilities, hooks, tests, and migrations.

```bash
check_file_exists \
  "packages/twenty-server/src/modules/policy/query-hooks/policy-create-one.pre-query.hook.ts" \
  "Policy create pre-query hook (agentId auto-assign)"
```

---

## Step-by-Step: Adding a Customization Entry

### Step 1: Identify which category your change belongs to

Open `CUSTOMIZATIONS.md` and find the right section:

| Section | When to use |
|---------|-------------|
| **Critical Files** (table at top) | Modified an upstream file that gets repeatedly wiped by merges |
| **Custom Server Modules** | Added a new directory under `packages/twenty-server/src/modules/` |
| **Modified Upstream Frontend Files** | Modified an upstream frontend file (organized by feature subsection) |
| **Other Frontend** | Frontend changes that don't fit existing subsections |

### Step 2: Add the CUSTOMIZATIONS.md entry

**For Critical Files** — add a row to the table:

```markdown
| `packages/twenty-front/src/modules/path/to/File.tsx` | What you changed (short) | Why it matters |
```

**For Custom Server Modules** — add a file list under a module heading:

```markdown
### `packages/twenty-server/src/modules/my-feature/`

- `query-hooks/my-feature-create-one.pre-query.hook.ts` — Description of what it does
- `utils/my-helper.util.ts` — Description
```

**For Modified Upstream Files** — add to or create a feature subsection table:

```markdown
### My Feature Name

| File | Modification |
|------|-------------|
| `path/to/file.ts` | What was changed |
```

### Step 3: Add check-customizations.sh entries

Add checks **in the same section grouping** as existing checks. Follow the pattern:

```bash
echo ""
echo "--- Critical: My Feature Name ---"
check_file_contains \
  "packages/twenty-front/src/modules/path/to/File.tsx" \
  "myUniquePattern" \
  "Human-readable reason this must survive merges"
```

**Rules for check entries:**
- One `check_*` call per distinct customization point (not per file — a file can have multiple checks)
- The description (third argument) should explain **why** the check matters, not just what it checks
- Group related checks under a single `echo "--- Section Name ---"` header
- For new Omnia files, use `check_file_exists` (they won't be overwritten, just need to still exist)
- For modified upstream files, use `check_file_contains` with a pattern that proves the modification is there
- For removed upstream code, use `check_file_not_contains` with the pattern that should stay gone

### Step 4: Verify

```bash
./scripts/check-customizations.sh
```

All entries should show `OK`. If any show `OVERWRITTEN`, `MISSING`, or `REVERTED`, fix the code.

---

## Common Patterns to Check For

### Code comment markers
When your change is small (1-3 lines) and could be missed during merge review:
```typescript
// OMNIA-CUSTOM: inline Log out
```
Then check for it:
```bash
check_file_contains "path/to/file.tsx" "OMNIA-CUSTOM: inline Log out" "Description"
```

### Imported identifiers
When you added a new import or function call to an upstream file:
```bash
check_file_contains "path/to/file.ts" "resolveCreateRecordActionLabels" "Must apply object-aware labels"
```

### Removed feature gates
When you removed a billing/plan/feature check:
```bash
check_file_not_contains "path/to/file.tsx" "isFeatureGateEnabled" "Feature gate removed for self-hosted"
```

### Entity columns
When you added a column to an upstream entity:
```bash
check_file_contains "path/to/entity.ts" "editWindowMinutes" "Entity must have custom column"
```

---

## Anti-Patterns

- **Don't skip this step.** "I'll add it later" means it gets forgotten and the next upstream merge silently breaks the feature.
- **Don't use fragile patterns.** `"return true"` matches too much. Use a pattern unique to the customization.
- **Don't duplicate descriptions.** The check-customizations.sh description and CUSTOMIZATIONS.md description should complement each other, not repeat verbatim.
- **Don't forget tests.** If you wrote a regression test for the customization, add a `check_file_exists` for the test file too.

---

## Checklist

Before marking your feature complete:

- [ ] All modified upstream files are documented in `CUSTOMIZATIONS.md`
- [ ] All new Omnia files are documented in `CUSTOMIZATIONS.md`
- [ ] Each customization has a matching `check_file_contains`, `check_file_not_contains`, or `check_file_exists` in `scripts/check-customizations.sh`
- [ ] `./scripts/check-customizations.sh` passes with all `OK`
- [ ] Any `OMNIA-CUSTOM` comment markers are added to small/subtle changes in upstream files
