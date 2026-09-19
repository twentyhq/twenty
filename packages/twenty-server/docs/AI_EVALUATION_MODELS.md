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

The contract is the AI SDK's, imported rather than restated.
`ai-models/types/ai-evaluation-model.type.ts` is a handful of aliases:

```ts
export type AiEvaluationModel = Experimental_EvaluationModel;
export type AiEvaluationModelQuestion = Experimental_EvaluationQuestion;
export type AiEvaluationModelAnswer =
  Experimental_EvaluationAnswer<Experimental_EvaluationQuestion>;
```

The aliases exist only so the `Experimental_` prefix stays out of the engine's
own code. Because they are aliases and not copies, a change to the spec breaks
the build here instead of drifting silently.

Providers are discovered structurally: `getEvaluationModelFactory` accepts any
provider object exposing an `evaluationModel(modelId)` factory — which is the
shape the SDK's own providers have. A gateway proxying several evaluation models
qualifies without a line of code here.

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

- **`NativeEvaluationRunner`** — calls the SDK's `experimental_evaluate` on a
  registered evaluation model. The provider constrains the answer, so an
  off-menu value is impossible and calibrated probabilities come back with it.
  Going through `evaluate` rather than the provider's `doEvaluate` directly buys
  the SDK's own result validation: an answer naming an option that was not
  offered, or a distribution that does not sum to one, is rejected before a
  workflow can branch on it. Retries are left to the workflow step
  (`maxRetries: 0`).
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

TypeSafe also reports how concentrated each distribution is, under its own
provider-metadata key. That statistic is *not* a probability — "confident" and
"likely" are different claims — so it is read out separately into
`confidenceByQuestionId` rather than folded into an answer.

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

`supportedQuestionTypes`, `maxCriteriaPerQuestion` and `maxScoreLevels` are
capabilities, not documentation: a request that exceeds any of them is refused
before any network call. A choice menu and a score rubric are capped very
differently — Jev takes 255 options but only 10 levels — so they are declared
and checked separately.
Both token costs are required for the same reason transcription requires
`costPerMinute` — an omitted price bills nothing while the provider still
charges, so free output has to say so with an explicit `0`.

## Turning Jev on

`@ai-sdk/typesafe-ai` ships as an ordinary dependency, wired through
`SdkProviderFactoryService` exactly like every other provider. Nothing is
resolved at call time and nothing is optional; the only thing an operator does
is set `TYPESAFE_AI_API_KEY`.

Evaluation support needs `ai` at 7.0.103 or newer, which is why this landed with
a bump from 7.0.93 across `twenty-server`, `twenty-shared` and `twenty-front`.
The three move together on purpose: `twenty-shared` re-exports SDK types that
cross package boundaries, so a version split makes structurally identical types
fail to assign. A `resolutions` entry keeps the transitive `@ai-sdk/provider`
copies on one version for the same reason.

Jev can also be reached through the AI Gateway, either as the plain model id
`typesafe-ai/jev` (needs `ai` 7.0.105+) or via `gateway.evaluationModel(...)`.
Twenty does not use the Gateway today, so the direct provider is the path that
fits the existing architecture: one package, one API key, no OIDC.

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
