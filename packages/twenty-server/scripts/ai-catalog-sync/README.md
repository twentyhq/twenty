# AI catalog

Three files in `src/engine/metadata-modules/ai/ai-models`, and two entry points
over them.

| File | What it is |
| --- | --- |
| `ai-models.json` | What every model is: identity, pricing, limits, modalities, efforts, benchmarks. No routes, no credentials. Synced daily. |
| `ai-self-host-spec.json` | What a self-hosted deployment serves: the five direct routes and their key templates. Hand-maintained. |
| `ai-providers.json` | The catalog the server bundles. Generated from the two above; a test fails if it is hand-edited. |

Cloud works the same way, from a private spec in twenty-infra, so a deployment
catalog is always a projection rather than a second copy of the truth.

## `index.ts` — sync the model catalog

Run daily by `.github/workflows/ci-ai-catalog-sync.yaml`. Reads models.dev for
model identity, pricing, context windows and availability, overlays Artificial
Analysis for intelligence, speed and cost per task, and writes `ai-models.json`
and `ai-model-benchmarks.json`, then projects the self-host spec over the first
to write `ai-providers.json`. Hand-maintained fields (`efforts`,
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

`--catalog` points at a different `ai-models.json`; it defaults to the
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

A route that serves a whole vendor says so instead of listing its models, which
is how self-host picks up new models with the daily sync:

```json
{ "name": "openai", "npm": "@ai-sdk/openai", "models": { "vendor": "openai" } }
```

A spec can rename a model for the route that deploys it (`as`) and override the
prices it negotiated, the limits its route caps, its label and its deprecation.
It cannot restate what a model is: modalities, reasoning support, efforts and
benchmarks always come from the catalog, which is what keeps a deployment from drifting away from the
measured truth. Naming a model the catalog does not carry fails the run rather
than publishing a route to nothing.

`project.ts` resolves everything it needs by source path, so a repository
holding a private spec can run it from a sparse checkout of these files and
`packages/twenty-shared/src/ai` without installing the monorepo and without any
API key.
