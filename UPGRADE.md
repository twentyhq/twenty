# Upgrade Guide: v1.0.x → v1.x.x

This guide provides step-by-step instructions for upgrading your Twenty self-hosted instance from any v1.0.x release to a newer v1.x.x release (e.g., v1.5.x).

---

## 1. Preparation

- **Backup your database and files.**
- Review release notes for breaking changes and new features.
- Stop all running containers:
  ```bash
docker-compose down
```

---

## 2. Update Your Codebase

- Pull the latest code for your desired v1.x.x version:
  ```bash
git fetch --all
git checkout v1.x.x # Replace with your target version
git pull
```

---

## 3. Clean Old Build Artifacts

- Remove old build files to prevent schema conflicts:
  ```bash
yarn clean
```
  Or manually delete any `dist` or `build` directories in your server/app folders.

---

## 4. Install Dependencies & Rebuild

- Install updated dependencies and rebuild:
  ```bash
yarn install
yarn build
```

---

## 5. Run Database Migrations

- Apply new migrations to update your database schema:
  ```bash
yarn database:migrate:prod
```

---

## 6. Flush Application Cache

- Clear any cached data to avoid stale schema or data issues:
  ```bash
yarn command:prod cache:flush
```

---

## 7. Restart All Containers

- Rebuild and start your containers:
  ```bash
docker-compose up -d --build
```

---

## 8. Verify & Troubleshoot

- Check logs for errors.
- Test your application (login, data access, settings, etc.).
- If you see GraphQL schema errors (e.g., `Field "apiKeys" already defined with a different type`), repeat steps 3–6 and ensure no custom plugins or schema extensions are causing conflicts.

---

## 9. Custom Plugins & Extensions

- If you use custom plugins or schema extensions, verify their compatibility with the new version.
- Update or remove any code referencing outdated types (e.g., `ApiKey` instead of `ApiKeyConnection`).

---

## 10. Environment Variables

- Ensure your environment variables are up-to-date and not referencing old paths or settings.

---

## 11. Need Help?

- Check [GitHub Issues](https://github.com/twentyhq/twenty/issues) for known problems and solutions.
- If you encounter persistent errors, provide your `docker-compose.yml` and details about custom plugins when seeking help.

---

## 12. Contributing

If you find missing steps or improvements, please submit a PR to update this guide!

---

**Last updated:** September 11, 2025
