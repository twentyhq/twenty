# Twenty Documentation

Official documentation for Twenty CRM, powered by [Mintlify](https://mintlify.com).

## 🌐 Live Site

Visit the documentation at [docs.twenty.com](https://docs.twenty.com)

## 📚 Content

This repository contains:
- **User Guide** (46 pages) - Complete guide for Twenty users
- **Developers** (24 pages) - Technical documentation for developers
- **Twenty UI** (25 pages) - UI component library documentation

## 🚀 Local Development

To run the documentation locally:

```bash
# From the twenty monorepo root
npx nx run twenty-docs:dev
```

The documentation will be available at `http://localhost:3000`

## 📝 Editing Content

### Adding/Editing Pages

1. Edit MDX files in the appropriate directory:
   - `user-guide/` - User documentation
   - `developers/` - Developer documentation
   - `twenty-ui/` - Component documentation

2. Update `docs.json` to add pages to navigation

### MDX Format

All documentation pages use MDX format with frontmatter:

```mdx
---
title: Page Title
description: Page description
image: /images/path/to/image.png
---

Your content here...
```

### Adding Images

1. Place images in the `/images/` directory
2. Reference them in MDX: `![Alt text](/images/your-image.png)`
3. Or use Mintlify Frame component:
```mdx
<Frame>
  <img src="/images/your-image.png" alt="Description" />
</Frame>
```

## 🔧 Configuration

- `docs.json` - Main Mintlify configuration (navigation, theme, etc.)
- `package.json` - Package dependencies and scripts
- `project.json` - Nx workspace configuration

## 📦 Building

```bash
# Build the documentation
npx nx run twenty-docs:build
```

## 🔗 Links

- [Twenty Website](https://twenty.com)
- [GitHub Repository](https://github.com/twentyhq/twenty)
- [Mintlify Documentation](https://mintlify.com/docs)

## 🤝 Contributing

To contribute to the documentation:

1. Fork the repository
2. Make your changes in the `packages/twenty-docs` directory
3. Test locally with `npx nx run twenty-docs:dev`
4. Submit a pull request

## 📄 License

This documentation is part of the Twenty project and is licensed under [AGPL-3.0](../../LICENSE).

