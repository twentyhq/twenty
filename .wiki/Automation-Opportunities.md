# Automation Opportunities

Analysis of high-signal combinations among existing tools, endpoints, templates, and workflows that can automate Twenty app creation. Organized by automation depth.

## Key Constraint

**Work within existing SDK surface. No Twenty source modifications unless minimal, durable, and survives upstream updates.**

## Architecture: No-Mod Meta-App Pipeline

The entire programmatic pipeline works today without any patches. Here's why:

### Why `twenty add` Is Unnecessary

The manifest builder (`buildAndValidateManifest`) discovers entities by:
1. Globbing `**/*.ts` and `**/*.tsx` under the app path (excluding node_modules, dist, .twenty)
2. Parsing each file for `export default defineXxx(...)` calls
3. Evaluating the file to extract the config

It does NOT care how files were created. `twenty add` is just an interactive wrapper around string template functions. A meta-app can write the same files directly.

### Why No Server Is Needed for Build

`twenty build` (unlike `twenty dev --once`) does NOT connect to a server. It:
1. Builds manifest from source
2. Runs esbuild on logic functions and front components
3. Runs typecheck
4. Writes `.twenty/output/`

Server is only needed for: deploy, install, exec, and client generation.

### Why No CLI Internals Are Needed

All define factories (`defineApplication`, `defineObject`, etc.) are public exports from `twenty-sdk/define`. Validation happens inside these factories. A generator can:
1. Call define factories to validate configs at generation time
2. Write the validated config to `.ts` files
3. Run `twenty build --tarball` to produce the deployable artifact

## Tier 1: Fully Automated Today (Zero Modifications)

### 1. Full Scaffold → Build → Deploy → Install → Test

**Already proven in CI** (`ci-create-app-e2e-minimal.yaml`):

```
npx create-twenty-app@latest my-app --skip-local-instance
cd my-app && yarn install
npx twenty app build
npx twenty app publish --api-url $URL --api-key $KEY
npx twenty app install --api-url $URL --api-key $KEY
npx twenty exec --functionName <name> -p '{}'
```

**Signal**: 10/10. Running in CI today. Zero gaps.

### 2. Programmatic Entity Generation (Bypass twenty add)

A meta-app writes entity files directly using known template patterns:

**Object file** (`src/objects/my-entity.ts`):
```typescript
import { defineObject, FieldType } from 'twenty-sdk/define';

export const NAME_FIELD_ID = '<uuid-v4>';

export default defineObject({
  universalIdentifier: '<uuid-v4>',
  nameSingular: 'myEntity',
  namePlural: 'myEntities',
  labelSingular: 'My Entity',
  labelPlural: 'My Entities',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name',
      icon: 'IconAbc',
    },
  ],
});
```

**Logic function file** (`src/functions/my-function.ts`):
```typescript
import { defineLogicFunction } from 'twenty-sdk/define';

const handler = async (params: { a: string }): Promise<{ result: string }> => {
  return { result: params.a };
};

export default defineLogicFunction({
  universalIdentifier: '<uuid-v4>',
  name: 'my-function',
  description: 'Description',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/my-function',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
```

**Front component file** (`src/components/my-component.front-component.tsx`):
```typescript
import { defineFrontComponent } from 'twenty-sdk/define';

const Component = () => <div>Hello</div>;

export default defineFrontComponent({
  universalIdentifier: '<uuid-v4>',
  name: 'my-component',
  description: 'Description',
  component: Component,
});
```

**Signal**: 10/10. The manifest builder will discover all of these. `twenty build --tarball` will validate + bundle them.

### 3. Full Programmatic Pipeline

```
# 1. Scaffold skeleton
npx create-twenty-app@latest my-app --name my-app \
  --display-name "My App" --description "Desc" \
  --skip-local-instance --yes

# 2. Write entity files programmatically
#    (generator writes .ts/.tsx files under src/objects, src/functions, etc.)
generator write-spec --from spec.json --to my-app/src/

# 3. Build (no server needed)
cd my-app && yarn install
npx twenty build --tarball

# 4. Deploy + install (needs server)
npx twenty deploy --remote target
npx twenty install --remote target

# 5. Smoke test
npx twenty exec --postInstall -p '{}'
```

**Signal**: 10/10. Every step works today. The generator in step 2 is the only new code — it writes files using the template patterns documented above.

## Tier 2: Meta-App Architecture

A Twenty app that runs inside Twenty and generates other Twenty apps.

### Architecture

```
Meta-App (deployed on Twenty workspace)
│
├── Logic Functions (backed by route triggers)
│   ├── POST /generate-app
│   │   ├── Accepts spec: { name, objects[], fields[], views[], roles[], functions[] }
│   │   ├── Runs create-twenty-app via child process
│   │   ├── Writes entity files from spec
│   │   ├── Runs twenty build --tarball
│   │   ├── Runs twenty deploy + install
│   │   └── Returns deployed app URL + status
│   │
│   ├── POST /generate-from-template
│   │   ├── Accepts template name (minimal, hello-world, postcard, custom)
│   │   ├── Clones template + patches spec
│   │   └── Same build/deploy/install flow
│   │
│   └── POST /validate-spec
│       ├── Imports define factories from twenty-sdk/define
│       ├── Runs validation on spec without writing files
│       └── Returns validation errors/warnings
│
├── Front Component (command menu UI)
│   ├── App spec builder form
│   ├── Template selector
│   ├── Deploy progress bar (updateProgress)
│   └── Post-deploy config panel
│
├── Pre-Install Logic Function
│   └── Validates workspace has required permissions
│
├── Post-Install Logic Function
│   └── Seeds default templates or configuration
│
└── Skills / Agents
    ├── AI-assisted spec generation from natural language
    └── Code review of generated app source
```

### What This Needs (All Within SDK Surface)

| Component | SDK Surface Used | Status |
|---|---|---|
| Route handler for generation | `defineLogicFunction` with `httpRouteTriggerSettings` | Works today |
| Child process execution | Node.js `child_process.execSync` | Standard Node |
| File writing | Node.js `fs` | Standard Node |
| Template string generation | Template patterns from `entity-*-template.ts` | Documented above |
| Validation at generation time | `twenty-sdk/define` factories | Public exports |
| Build pipeline | `yarn twenty build --tarball` | Works headless |
| Deploy/install | `yarn twenty deploy` + `yarn twenty install` | Works headless |
| Progress reporting | `updateProgress` from `twenty-sdk/front-component` | Public export |
| Billing | `chargeCredits` from `twenty-sdk/billing` | Public export |
| Connection management | `getConnection` from `twenty-sdk/logic-function` | Public export |
| AI assistance | `defineSkill` + `defineAgent` | Public exports |
| CI/CD for generated apps | Template workflows from create-twenty-app | Proven in CI |

**Zero SDK modifications needed.**

### Implementation as External CLI/Action Combo

The meta-app logic can also run outside Twenty as a standalone tool:

```
app-generator/
├── src/
│   ├── generator.ts          # Core: spec → entity files
│   ├── templates/            # Template string functions (mirroring entity-*-template.ts)
│   ├── pipeline.ts           # Scaffold → write → build → deploy → install
│   ├── validators.ts         # Import define factories, validate spec
│   └── cli.ts                # CLI entry point
├── action.yml                # GitHub Action composite action
└── workflow-template.yml     # Reusable workflow for generated apps
```

This external tool:
1. Can be invoked from a Twenty app logic function (via route trigger + child_process)
2. Can run as a GitHub Action (like deploy-twenty-app/install-twenty-app)
3. Can be a CLI tool for local development

### GitHub Action Combo

```yaml
# .github/actions/generate-twenty-app/action.yml
name: Generate Twenty App
inputs:
  spec:
    description: 'JSON spec for the app'
    required: true
  api-url:
    required: true
  api-key:
    required: true
runs:
  using: composite
  steps:
    - run: npx create-twenty-app@latest generated-app --skip-local-instance --yes
    - run: node generator.mjs  # writes entity files from spec JSON
    - run: cd generated-app && yarn install && npx twenty build --tarball
    - run: cd generated-app && npx twenty deploy --remote target
    - run: cd generated-app && npx twenty install --remote target
```

This composes with existing actions:
- `spawn-twenty-docker-image` for test instances
- `deploy-twenty-app` / `install-twenty-app` as alternatives

## What Would a Minimal Patch Unlock

If we wanted to go further, the single highest-leverage patch would be:

### Export `buildAndValidateManifest` + `writeManifestToOutput` from `twenty-sdk/cli`

**Current state**: These are internal to the CLI, accessible only via `twenty build` command.

**Patch**: Add re-exports in `packages/twenty-sdk/src/cli/operations/index.ts`:
```typescript
export { buildAndValidateManifest } from '@/cli/utilities/build/manifest/build-and-validate-manifest';
export { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
```

**What it unlocks**: Programmatic manifest validation + output without spawning `twenty build` as a child process. The meta-app could validate specs in-process.

**Durability**: These are stable internal APIs used by `twenty build`, `twenty dev`, and `twenty dev --once`. Low churn risk. If upstream renames them, the patch is a two-line change.

**Verdict**: Nice-to-have, not required. `twenty build --tarball` via child_process works fine for the meta-app pipeline.

## Signal Summary

| Approach | Signal | Source Mods | Gaps |
|---|---|---|---|
| CI pipeline (scaffold → build → deploy → install → test) | 10/10 | Zero | None |
| Direct entity file writing (bypass twenty add) | 10/10 | Zero | None |
| Full programmatic pipeline | 10/10 | Zero | Generator code is new |
| Meta-app (app inside Twenty) | 9/10 | Zero | Logic function needs child_process |
| External CLI/Action combo | 9/10 | Zero | None |
| Export manifest API (minimal patch) | 10/10 | 2 lines | Nice-to-have only |
