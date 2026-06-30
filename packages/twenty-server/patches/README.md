# How to patch a dependency

`yarn patch-commit -s` does not work in our monorepo. Use the workflow below instead.

## New patch

```bash
yarn patch <package-name>
# Yarn prints a temp folder path — edit files there, then:
yarn patch-commit <temp-folder> > packages/twenty-server/patches/<package+name+version>.patch
yarn install --mode update-lockfile && yarn install
```

Reference the patch in `packages/twenty-server/package.json`:

```
"<package-name>": "patch:<package-name>@<version>#./patches/<package+name+version>.patch"
```

## Updating an existing patch

```bash
yarn patch -u <package-name>   # extract with current patches applied (PATCHED)
yarn patch <package-name>      # extract clean original (CLEAN)
# Edit files in PATCHED, then copy them into CLEAN
yarn patch-commit <CLEAN> > packages/twenty-server/patches/<package+name+version>.patch
yarn install --mode update-lockfile && yarn install
```
