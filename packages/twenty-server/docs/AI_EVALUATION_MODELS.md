# Evaluation Models

Twenty's AI registry serves three kinds of model. Two of them generate content:
`language` answers a prompt with text and tool calls, `transcription` turns audio
into text. The third, `evaluation`, generates nothing — it is handed a state and
a set of typed questions and returns one typed answer per question, with a
probability distribution where the provider computes one.

TypeSafe AI's **Jev** is the first model of this kind in the catalog. This
document explains where evaluation models sit, why they are not language models,
and what a feature has to do to use one.

## Why a separate kind

An evaluation model has no context window, no output ceiling, no effort ladder
and no streaming. It cannot answer a chat turn, and it never emits a token the
caller has to parse. Registering one as a language model would put it in the
model picker, in agent selection, and in reasoning-effort resolution — three
places where every operation on it is undefined.

So the registry keeps it apart, exactly as it already does for transcription:

| | `language` | `transcription` | `evaluation` |
|---|---|---|---|
| Registry | `modelRegistry` | `transcriptionRegistry` | `evaluationRegistry` |
| Config cache | `modelConfigCache` | `transcriptionConfigCache` | `evaluationConfigCache` |
| Priced on | tokens | minutes | tokens |
| In the model picker | yes | no | no |

A model declares its kind in `ai-providers.json`. Everything else follows from
that one field: `AiModelRegistryService` routes registration, and the catalog
schema refuses a model that declares fields its kind cannot use.

## The provider contract

`AiEvaluationModel` (in `ai-models/types/ai-evaluation-model.type.ts`) restates
the AI SDK's `EvaluationModelV4` specification field for field:

```ts
type AiEvaluationModel = {
  readonly specificationVersion: 'v4';
  readonly provider: string;
  readonly modelId: string;
  readonly supportedQuestionTypes: readonly AiEvaluationQuestionType[];
  doEvaluate(options: AiEvaluationModelCallOptions): PromiseLike<AiEvaluationModelResult>;
};
```

It is declared rather than imported on purpose. The SDK exports this shape only
under `Experimental_` names that change in patch releases, and the engine should
depend on the shape a provider must have, not on which release names it. Nothing
in Twenty imports an experimental SDK symbol.

Providers are discovered structurally: `getEvaluationModelFactory` accepts any
provider object exposing an `evaluationModel(modelId)` factory. A gateway
proxying several evaluation models qualifies without a line of code here.

### Question types

Three, matching the specification:

- **`choice`** — pick one of a named set of options. This is classification and
  routing. The answer names the winning option and, where the provider supplies
  one, the distribution over all of them.
- **`score`** — grade against an ordered rubric. The answer is a fractional
  position on the ladder, so `1.4` sits between the second and third level.
- **`boolean`** — estimate P(true). The answer is that probability, not a
  confidence in whichever side won.

## The two runners

`AiEvaluationService` is the only entry point. It resolves a model id to a
runner, and the two runners answer the same questions through the same result
type:

- **`NativeEvaluationRunner`** — calls `doEvaluate` on a registered evaluation
  model. The provider constrains the answer, so an off-menu value is impossible
  and calibrated probabilities come back with it.
- **`LanguageModelEvaluationRunner`** — asks an ordinary language model for
  structured output matching a schema built from the same questions. Answers
  stay on-menu because the schema constrains them. They are **not** calibrated,
  so this runner reports no probabilities at all rather than reporting a number
  the model wrote about itself.

Only the fallback builds a prompt, and the state it embeds is whatever a record
or upstream step happened to contain. It is fenced with a per-call random tag so
that text cannot close the block and have the rest of itself read as prompt, and
the system prompt says the fenced content is data rather than instructions. The
schema already bounds *what* an answer may be; this bounds what can steer it.

Resolution order:

1. An explicit model id resolves against whichever registry holds it.
2. Otherwise, the first non-deprecated evaluation model in the catalog.
3. Otherwise, the workspace's default language model.

This is what makes the feature safe to build on. A workspace with no evaluation
provider configured still runs every classification step; configuring one makes
those steps faster, cheaper and calibrated without touching a workflow.

Every result carries `runnerKind`, so a caller that branches on a probability can
tell which kind of model produced it.

## Adding an evaluation model

Add an entry to `ai-evaluation-providers.json` — **not** `ai-providers.json`,
which is projected from models.dev every day. models.dev describes language
models only (and the sync filters on tool calling besides), so an evaluation
model added there is dropped by the next rebuild. `DefaultAiCatalogService`
merges the two:

```json
"typesafe-ai": {
  "npm": "@ai-sdk/typesafe-ai",
  "label": "TypeSafe AI",
  "apiKey": "{{TYPESAFE_AI_API_KEY}}",
  "models": [
    {
      "name": "jev-latest",
      "label": "Jev",
      "kind": "evaluation",
      "inputCostPerMillionTokens": 0.042,
      "outputCostPerMillionTokens": 0,
      "supportedQuestionTypes": ["choice", "score", "boolean"],
      "maxCriteriaPerQuestion": 255,
      "medianLatencyMs": 200
    }
  ]
}
```

`supportedQuestionTypes` and `maxCriteriaPerQuestion` are capabilities, not
documentation: a request that exceeds either is refused before any network call.
Both token costs are required for the same reason transcription requires
`costPerMinute` — an omitted price bills nothing while the provider still
charges, so free output has to say so with an explicit `0`.

## Installing a provider package

Evaluation provider packages are **optional peers**. An instance that never
classifies anything should not carry the dependency, and a catalog entry whose
package is absent stays visible but cannot run: `SdkProviderFactoryService`
resolves the factory at call time and logs a warning instead of failing boot.

To turn Jev on:

```bash
yarn workspace twenty-server add @ai-sdk/typesafe-ai
```

then set `TYPESAFE_AI_API_KEY`.

> At the time of writing, `@ai-sdk/typesafe-ai` and the `ai` releases carrying
> `experimental_evaluate` are both younger than this repository's
> `npmMinimalAgeGate: 3d` supply-chain gate, so neither is in `yarn.lock` yet.
> Nothing in the engine depends on them; the gate clearing is the only thing
> between here and a working Jev.

## Using `experimental_evaluate` later

`NativeEvaluationRunner` calls `doEvaluate` directly. The AI SDK's
`experimental_evaluate` wraps the same call with model-id resolution, retries and
result validation. Adopting it is a change to that one file — the runner's
signature, the result type and every caller stay as they are. It is worth doing
once the API loses its `experimental_` prefix; until then, workflow steps already
carry their own retry policy.

## Billing

Evaluation models bill on tokens like language models. `computeCostBreakdown`
takes `AiModelCostConfig` — the fields costing actually reads — so both kinds go
through one implementation, and `AiBillingService` looks in the evaluation config
cache before the language one.

## Validation

A step is checked before a workflow can be activated, not only when it runs:
`validateWorkflowClassifyStep` refuses a blank state, a question with no
instructions, a choice with no options, a rubric with fewer than two levels, an
answer name that is not a valid variable key, and two questions sharing a name.
Both of its codes are in `NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES`, so a
half-configured node reports the gap in the editor instead of aborting a run.

## The Classify workflow node

`WorkflowActionType.CLASSIFY` is the first consumer. Its settings are one shared
state and a list of questions; its output is one answer per question, keyed by
the question's name so downstream steps read
`{{stepId.answers.<name>.choice}}`.

The node names no provider. It runs on whatever `AiEvaluationService` resolves,
which is the point: a workflow built today against a language model starts
running on Jev the moment an operator configures it, with no edit.
