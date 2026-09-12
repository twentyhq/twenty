# AI catalog

Two entry points over the same committed data.

## `index.ts` — sync the canonical catalog

Run daily by `.github/workflows/ci-ai-catalog-sync.yaml`. Reads models.dev for
model identity, pricing, context windows and availability, overlays Artificial
Analysis for intelligence, speed and cost per task, and writes
`src/engine/metadata-modules/ai/ai-models/ai-providers.json` plus
`ai-model-benchmarks.json`. Hand-maintained fields (`efforts`,
`dataResidency`, `zeroDataRetention`) survive the rebuild.

```bash
npx nx run twenty-server:ts-node-no-deps-transpile-only -- \
  ./scripts/ai-catalog-sync/index.ts --dry-run
```

## `project.ts` — derive a deployment catalog

A deployment serves a subset of the catalog through its own routes: Azure, a
Bedrock region, a gateway, or a first-party key. It declares only what is its
own — which routes exist, their credentials, and which catalog models each one
serves — and this projects the catalog through that spec.

```bash
npx tsx ./scripts/ai-catalog-sync/project.ts \
  --spec ./my-deployment.json \
  --out ./ai-catalog.json
```

`--catalog` points at a different `ai-providers.json`; it defaults to the
committed one. The output has the same shape, so a server loads it through
`AI_CATALOG_STORAGE_PATH` with no further processing.

A spec looks like this:

```json
{
  "providers": [
    {
      "name": "azure-foundry",
      "npm": "@ai-sdk/azure",
      "label": "Azure AI Foundry",
      "apiKey": "{{AZURE_FOUNDRY_API_KEY}}",
      "baseUrl": "{{AZURE_FOUNDRY_BASE_URL}}",
      "dataResidency": "eu",
      "labelSuffix": " (Azure)",
      "models": [
        "gpt-5.6-luna",
        { "model": "gpt-5.6-sol", "cachedInputCostPerMillionTokens": 0.5 }
      ]
    },
    {
      "name": "amazon-bedrock",
      "npm": "@ai-sdk/amazon-bedrock",
      "region": "eu-central-1",
      "models": [
        { "model": "claude-opus-4-7", "as": "eu.anthropic.claude-opus-4-7" }
      ]
    }
  ]
}
```

A spec can rename a model for the route that deploys it (`as`) and override the
prices it negotiated, its label and its deprecation. It cannot restate what a
model is: context window, modalities, efforts and benchmarks always come from
the catalog, which is what keeps a deployment from drifting away from the
measured truth. Naming a model the catalog does not carry fails the run rather
than publishing a route to nothing.

`project.ts` imports nothing from the workspace, so a repository holding a
private spec can run it from a sparse checkout of these files without
installing the monorepo and without any API key.
