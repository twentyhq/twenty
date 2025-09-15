# Twenty JSON Schemas

This directory contains JSON Schema definitions for Twenty application manifests and agent configurations. These schemas provide validation, autocomplete, and documentation for developers building Twenty applications.

## Schema URLs

The schemas are published at the following URLs for public access:

- **App Manifest**: `https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-cli/schemas/app-manifest.schema.json`
- **Agent**: `https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-cli/schemas/agent.schema.json`

## IDE Support

### VS Code

VS Code automatically provides IntelliSense, validation, and hover documentation when you include the `$schema` property in your JSONC files:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-cli/schemas/app-manifest.schema.json",
  "standardId": "550e8400-e29b-41d4-a716-446655440000",
  "label": "My App",
  // ... rest of your manifest
}
```

### Other IDEs

Most modern IDEs that support JSON Schema will work with these schemas:
- IntelliJ IDEA / WebStorm
- Sublime Text (with LSP)
- Vim/Neovim (with LSP)
- Emacs (with LSP)

## Schema Features

### Validation

The schemas provide comprehensive validation including:

- **Required fields**: Ensures all mandatory properties are present
- **Type checking**: Validates data types (string, number, object, array)
- **Format validation**: UUID patterns, version formats, naming conventions
- **Enum constraints**: Restricts values to allowed options (e.g., model IDs)
- **Length constraints**: Minimum/maximum lengths for strings and arrays

### Documentation

Each property includes:
- Human-readable descriptions
- Usage examples
- Validation rules
- Default values where applicable


## CLI Integration

The Twenty CLI automatically:

1. **Validates** all manifests and agent files against these schemas
2. **Generates** new files with proper `$schema` references
3. **Provides** helpful error messages when validation fails

## Development Workflow

1. **Create** your app with `twenty app init my-app`
2. **Edit** the generated JSONC files with full IDE support
3. **Validate** automatically when running CLI commands
4. **Deploy** with confidence knowing your configuration is valid

## Schema Versioning

Schemas are versioned alongside the Twenty CLI. Breaking changes will:
- Be documented in release notes
- Include migration guides
- Maintain backward compatibility when possible

## Contributing

When updating schemas:

1. Update the schema files in this directory
2. Test with real manifests and agents
3. Update examples and documentation
4. Ensure backward compatibility or provide migration path

The schemas are automatically published to GitHub raw URLs when merged to main.
