# MCP catalog

`src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/marketplace-mcp-servers.json`
is the list of MCP servers the marketplace offers. The server reads only this
file: it never calls a registry at runtime.

`index.ts` rebuilds every entry already in the file, and adds the ones passed
with `--add`:

- URL and icon come from the
  [official MCP registry](https://registry.modelcontextprotocol.io), where the
  vendor publishes them under a domain-verified name.
- The label, homepage, one-liner, tool names and read/write access come from
  Anthropic's connector directory. Copy that mentions another product is
  dropped, and the listing falls back to the registry description.
- A vendor missing from the registry, or listed there with an API-key header
  only, is read from the connector directory instead. Check that its URL is on
  the vendor's own domain before committing.

Only list a server Twenty can sign in to without a pre-registered OAuth app:
its authorization server must offer dynamic client registration or client ID
metadata documents. Asana, Docusign, GitHub and HubSpot do not.

Listing a server is a reviewed pull request: run the script with its registry
name, read the generated entry, commit.

```bash
npx nx run twenty-server:ts-node-no-deps-transpile-only -- \
  ./scripts/mcp-catalog-sync/index.ts --add com.stripe/mcp
```

`.github/workflows/ci-mcp-catalog-sync.yaml` runs it weekly without `--add` and
opens a pull request when an entry changed.
