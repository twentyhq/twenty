# Workspace Upgrade Command System

The workspace upgrade command system manages the versioning and upgrading of workspace data across Twenty's version changes. This system provides two commands:

1. **`upgrade`**: The main command that automatically upgrades workspaces across multiple versions in sequence (from any supported version to the latest)
2. **`upgrade-specific-version`**: A specialized command for upgrading to a specific version (requires the `--version` parameter)

## Architecture

The upgrade command system consists of the following components:

1. **UpgradeCommand**: The main command that orchestrates upgrading through multiple versions sequentially.
2. **SingleVersionUpgradeCommand**: A command for single-version upgrades that manages version-specific migration logic.
3. **UpgradeCommandRunner**: The base class for upgrade commands that handles the core upgrade logic.

## Dynamic Version Discovery

The system automatically discovers available version upgrade paths from the directory structure:

- Each version has its own directory in the format `0-XX` (e.g., `0-43`, `0-44`, etc.)
- Version paths are determined by parsing these directories and connecting them in sequence
- No hardcoded version paths are needed - adding a new version is as simple as adding a new directory

## Adding a New Version Upgrade

When releasing a new version that requires workspace data migrations:

1. Create a new directory for the version (e.g., `0-53` for version 0.53.0)
2. Create necessary migration commands in the directory
3. Create a module for the version
4. Register the module in `upgrade-version-command.module.ts`
5. Add the commands to `SingleVersionUpgradeCommand`:

```typescript
// In SingleVersionUpgradeCommand constructor:
this.versionCommands['0.52.0'] = {
  beforeSyncMetadata: [
    // Commands to run before metadata sync
    this.newCommand1,
    this.newCommand2,
  ],
  afterSyncMetadata: [
    // Commands to run after metadata sync
    this.newCommand3,
  ],
};
```

That's it! The system will automatically discover the new version directory and include it in the upgrade path.

## Command Usage

### Main Upgrade Command

The `upgrade` command automatically upgrades workspaces from any supported version to the latest version by determining the necessary upgrade path and applying the appropriate migrations in sequence:

```bash
# Upgrade all active workspaces to the latest version
npx nx run twenty-server:command upgrade

# Upgrade specific workspace
npx nx run twenty-server:command upgrade -w workspace-id
```

### Version-Specific Upgrade Command

The `upgrade-specific-version` command allows you to upgrade with a specific version's migration logic:

```bash
# Upgrade specific version (requires --version parameter)
npx nx run twenty-server:command upgrade-specific-version --version 0.51.0

# With specific workspace ID
npx nx run twenty-server:command upgrade-specific-version --version 0.51.0 -w workspace-id
```

## Compatibility

**Minimum Supported Version**: 0.43.0

Workspaces with versions below the minimum supported version cannot be upgraded and would require manual intervention.

## Best Practices

1. **Version Naming**: Follow the established pattern for directory names (`0-XX`) and ensure versions increment correctly
2. **Command Organization**: Keep migration commands in their version-specific directories
3. **Idempotence**: Ensure migrations are idempotent (can run multiple times without side effects)
4. **Testing**: Verify upgrades against various starting versions
5. **Documentation**: Document any unusual or complex migration steps 