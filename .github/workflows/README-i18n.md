# Documentation i18n Workflows

This directory contains workflows for managing documentation translations via Crowdin.

## Workflows

### `docs-i18n-push.yaml`
**Purpose:** Upload English source MDX files to Crowdin for translation

**Triggers:**
- Push to `main` branch when MDX files change
- Manual trigger via `workflow_dispatch`

**What it does:**
1. Checks out the `main` branch
2. Uploads all MDX files from `packages/twenty-docs/` to Crowdin
3. Excludes already-translated files (e.g., `/fr/**`)

**Configuration:**
- Currently supports French (`fr`) only
- Uses `type: "md"` in `crowdin.yml` for MDX files

---

### `docs-i18n-pull.yaml`
**Purpose:** Download translated MDX files from Crowdin

**Triggers:**
- Scheduled: Every 2 hours (`0 */2 * * *`)
- Manual trigger via `workflow_dispatch`

**What it does:**
1. Checks out the `main` branch
2. Switches to the `i18n` branch
3. Downloads French translations from Crowdin
4. Commits changes if new translations are available
5. Creates/updates a PR to merge translations into `main`

**Configuration:**
- Downloads only French (`fr`) translations
- Skips untranslated files (`skip_untranslated_files: true`)
- Uses the `i18n` branch for staging translations

---

## Known Issues

### Crowdin MDX Formatting

**Problem:** Crowdin sometimes modifies the structure of MDX files during translation:
1. **Indenting JSX components** - Adds indentation to `<Warning>`, `<Accordion>`, etc., making them children of list items
2. **Merging closing tags** - Puts closing tags like `</Accordion>` on the same line as content

**Impact:** This breaks MDX parsing and prevents deployment

**Example:**
```mdx
// ❌ INCORRECT (Crowdin may produce this)
- List item text
  <Warning>
  Content
  </Warning>

// ✅ CORRECT (Should be at root level)
- List item text
<Warning>
Content
</Warning>
```

**Solution:**
If you see MDX parsing errors after pulling translations:
1. Check for indented JSX tags
2. Ensure closing tags are on their own lines
3. Fix manually and commit to the `i18n` branch

**Future Prevention:**
Consider using Crowdin's "hidden strings" feature or custom processing rules to protect JSX components from being reformatted.

---

## Adding More Languages

Currently configured for French only. To add more languages:

1. **Enable the language in Crowdin project**
   - Go to Crowdin project settings
   - Add the target language (e.g., Spanish `es`, German `de`)

2. **Update `docs-i18n-pull.yaml`**
   ```yaml
   # Change from single language:
   download_language: fr
   
   # To multiple languages (comma-separated):
   download_language: 'fr,es,de'
   
   # Or remove entirely to download all enabled languages
   ```

3. **Test with one language at a time**
   - Use `workflow_dispatch` to manually trigger
   - Verify translations before enabling automated pulls

4. **Update path exclusions**
   ```yaml
   # In docs-i18n-push.yaml
   paths:
     - 'packages/twenty-docs/**/*.mdx'
     - '!packages/twenty-docs/fr/**'
     - '!packages/twenty-docs/es/**'  # Add new exclusions
     - '!packages/twenty-docs/de/**'
   ```

---

## Manual Workflow Triggers

```bash
# Push source files to Crowdin
gh workflow run docs-i18n-push.yaml

# Pull translations from Crowdin
gh workflow run docs-i18n-pull.yaml

# Force pull even if no changes detected
gh workflow run docs-i18n-pull.yaml -f force_pull=true
```

---

## Configuration Files

- **`crowdin.yml`** - Crowdin CLI configuration
  - Defines source and translation file paths
  - Specifies file type (`type: "md"` for MDX files)
  - Maps English files to translated paths

---

## Troubleshooting

### Translations not appearing
- Check if files are uploaded to Crowdin project
- Verify translations are marked as complete in Crowdin UI
- Try running pull workflow manually
- Check if `skip_untranslated_files: true` is preventing download

### MDX parsing errors
- See "Known Issues" section above
- Check for indented JSX tags
- Verify closing tags are on separate lines

### Workflow not triggering
- Ensure changes are in the correct path (`packages/twenty-docs/`)
- Check workflow permissions in repository settings
- Verify `CROWDIN_PERSONAL_TOKEN` secret is set

---

## Related Files

- `.github/workflows/docs-i18n-push.yaml`
- `.github/workflows/docs-i18n-pull.yaml`
- `crowdin.yml`
- `packages/twenty-docs/`

