# Mintlify Migration Summary

## What Was Migrated

### Documentation Files
- **69 MDX files** copied from twenty-website to twenty-docs
- **45 User Guide articles**
- **22 Developer documentation articles**
- **2 Getting Started guides** (existing)

### Images & Assets
- **81 images** copied to `public/images/`
- User guide screenshots
- Developer documentation images
- Logo and branding assets

### Navigation Structure
- Complete `mint.json` configuration with tabs and nested navigation
- User Guide tab with 11 sections
- Developers tab with 6 sections

## Components Converted

### Custom Components → Mintlify Equivalents
- `<ArticleWarning>` → `<Warning>`
- `<ArticleLink href="...">text</ArticleLink>` → `[text](...)`
- `<ArticleEditContent>` → Removed (not needed)

### Still Need Manual Review
Some components may need additional conversion:
- `<ArticleTabs>` - Mintlify uses `<Tabs>` component
- Embedded iframes/videos - May need adjustment
- Custom styled elements - Review for Mintlify compatibility

## Directory Structure

```
packages/twenty-docs/
├── mint.json                       # Main configuration
├── user-guide/
│   ├── getting-started/           # 7 files
│   ├── data-model/                 # 6 files
│   ├── crm-essentials/             # 4 files
│   ├── views/                      # 2 files
│   ├── workflows/                  # 7 files
│   ├── collaboration/              # 3 files
│   ├── integrations-api/           # 3 files
│   ├── reporting/                  # 1 file
│   ├── settings/                   # 9 files
│   ├── pricing/                    # 1 file
│   └── resources/                  # 2 files
├── developers/
│   ├── self-hosting/               # 5 files
│   ├── api-and-webhooks/           # 2 files
│   ├── frontend-development/       # 8 files
│   ├── backend-development/        # 7 files
│   ├── local-setup.mdx
│   └── bug-and-requests.mdx
└── public/
    └── images/                     # 81 images
```

## Testing

Start the local Mintlify dev server:
```bash
npx nx run twenty-docs:dev
```

Open http://localhost:3000 to preview all migrated documentation.

## Deployment

To deploy to Mintlify:
1. Push changes to GitHub
2. Connect the repo in Mintlify dashboard
3. Set subdirectory to `packages/twenty-docs`
4. Mintlify will auto-deploy and generate search embeddings

## Next Steps

1. **Manual Review** - Check for any component conversion issues
2. **Fix Image Paths** - Verify all images render correctly
3. **Test Navigation** - Ensure all internal links work
4. **Deploy** - Push to production Mintlify
5. **Update Helper Agent** - Verify searchArticles tool works with full content
6. **Deprecate twenty-website docs** - Once migration is confirmed working

## Known Issues to Review

- ArticleTabs components may need manual conversion
- Some images may have incorrect paths
- Custom styled components may need adjustment
- Video embeds might need review

