# Classification models and the Classify workflow action

Decision, 19 September 2026: expose a provider-neutral `CLASSIFY` action. Add Jev as
an **evaluation** model in the existing model catalog, with a separate typed
execution path. Keep agents, tools, chat tiers and classification distinct.

## Product contract

The action accepts an explicit model, text (including workflow variables),
instructions, and at least two unique category labels with descriptions. It
returns `category`, `probability`, `probabilities`, `modelId`, `resolvedModelId`,
and token `usage`. Those fields can feed existing conditions, branches and record
updates. The output schema is known before the first run.

- Jev returns the chosen category's probability and the full distribution. We do
  not expose TypeSafe's distribution-derived `confidence` statistic under the
  name probability: the two numbers have different meanings.
- Existing language models use AI SDK structured output constrained to the same
  category labels. Probability fields are `null`; prompting an LLM for a number
  would not make it a calibrated probability.
- The action never silently falls back to another provider. A workflow author can
  explicitly branch or handle failure, making cost, data handling and uncertainty
  visible. Check that probability is available before applying a threshold.
- Model IDs and category labels remain explicit. Add an `other` category when the
  taxonomy needs one, and route uncertain cases to an appropriate review step.

## Model and provider architecture

`kind: "evaluation"` extends the existing language/transcription distinction.
Evaluation models share catalog IDs, configuration refresh, admin enablement,
provider access rules, and token pricing. They never enter the language registry,
chat picker or tier/default resolution. Setting one as a chat default is rejected.
Existing model definitions without a kind still mean language models.

Provider configuration has exactly one transport: `npm` for existing AI SDK
providers, or `evaluationAdapter` for a native evaluation provider. It is not
necessary to claim an OpenAI-compatible chat endpoint or manufacture a
`LanguageModel` to register Jev. The TypeSafe adapter advertises only the
classification operation that Twenty currently supports; score and boolean
questions can be added when product requirements justify them.

`AiClassificationModel` is the small provider boundary. The workflow does not know
TypeSafe's endpoint, question names or response envelope. `AiClassificationService`
validates the request, checks model availability and usage quotas, executes the
selected backend, and records usage through existing AI billing. Workspace
execution context supplies member attribution.

The native adapter uses the fixed HTTPS endpoint, disallows redirects, has a
30-second timeout, validates categories/distributions/metering, and sanitizes
provider errors. It does not retry internally; the workflow's existing retry
policy owns retries. Provider-specific limits stay in the adapter (255 choices
for Jev). Configuration values that the adapter cannot honor are rejected.

No entity or database migration is needed: workflow settings and the provider
catalog already support structured configuration. No translation catalogs or
provider credentials are committed.

## Setup

Set `TYPESAFE_API_KEY` in the instance configuration. The built-in catalog includes
`typesafe/jev-1.13.0` at $0.042 per million input tokens and $0 per output token.
The key stays on the server. Add a Classify node, select Jev, and enter the text,
instructions and categories. Existing configured language models are also
available in the same node.

Deployments replacing the built-in catalog through `AI_CATALOG_STORAGE_PATH`
need to add this entry to their managed catalog:

```json
{
  "typesafe": {
    "evaluationAdapter": "typesafe",
    "label": "TypeSafe AI",
    "apiKey": "{{TYPESAFE_API_KEY}}",
    "models": [{
      "name": "jev-1.13.0",
      "label": "Jev 1.13",
      "kind": "evaluation",
      "inputCostPerMillionTokens": 0.042,
      "outputCostPerMillionTokens": 0,
      "contextWindowTokens": 32000
    }]
  }
}
```

Templates are resolved only in trusted catalogs, as for other providers. Custom
`AI_PROVIDERS` entries follow existing custom-provider entitlement and credential
rules. The adapter currently connects directly to TypeSafe; it is not a proxy
configuration. Data-residency and retention guarantees remain unasserted unless
an operator has established them for their deployment.

Pin the version rather than `jev-latest` when routing thresholds have been
validated against a particular model. TypeSafe documents 64k tokens across all
questions and 32k for state plus the longest question. This action sends one
question, so its effective context limit is 32k; the provider enforces token
limits with its own tokenizer.

## AI SDK support

Yes. AI SDK **7.0.103** introduced `experimental_evaluate` and a separate evaluation
model specification with Choice, Score and Boolean questions. **7.0.104** added
registry/alias support, and **7.0.105** added automatic Gateway resolution for
`typesafe-ai/jev`. This is an evaluation API, not `generateText`, chat completions
or a generic structured-output LLM.

The PR base uses **7.0.93** (the original working checkout used 6.0.97). This change
keeps those dependencies unchanged and uses TypeSafe directly. Upgrading to
7.0.105 is a viable follow-up; the Gateway integration introduces Gateway
credentials/routing and the evaluation surface is explicitly experimental.
Twenty's persisted workflow contract should remain independent of that surface.
A future adapter can call `experimental_evaluate` without changing saved nodes,
while validating that its probability and usage semantics match this contract.

Do not upgrade the entire agent stack merely to disguise Jev as a language model.
Equally, do not grow a private multi-provider evaluation SDK: adopt the upstream
evaluation abstraction behind this small boundary as supported backends expand.

## Cost and rollout recommendation

Published TypeSafe inference cost, assuming **all billable input** (text,
instructions and category descriptions) totals 1,000 tokens per classification:

| Classifications | Input tokens | Provider cost |
| --- | ---: | ---: |
| 1,000 | 1 million | $0.042 |
| 100,000 | 100 million | $4.20 |
| 1,000,000 | 1 billion | $42.00 |

At 5,000 tokens per classification, multiply these figures by five. Formula:
`calls × average billable input tokens × 0.042 / 1,000,000`. Retries incur another
request. These are provider costs, excluding Twenty credit conversion, other
workflow steps, hosting and taxes; temporary Gateway promotions are not the
basis for the estimate. Pricing was checked on 19 September 2026.

Engineering planning estimate: approximately **4–7 engineer-days** for an
integration of this scope including UI, model isolation, billing and tests, plus
**2–5 days** for a representative evaluation set and a monitored rollout. These
are estimates, not measured time or a quote. Multiply by the team's loaded daily
rate for a monetary engineering budget. Avoid a large general-purpose decision
engine until real workflows require it.

Before enabling automatic business actions, evaluate Jev and a small LLM on the
same held-out CRM examples, including missing context, ambiguous requests,
unsupported categories and non-English input. Measure accuracy, the rate of
wrong automatic actions at each threshold, abstention rate, latency and actual
billable tokens. Calibrate thresholds per task/model version. Structural
validity does not guarantee a correct business decision; the vendor's speed and
calibration claims are not results measured on Twenty's workloads.

## Sources

- [TypeSafe model versions, pricing and limits](https://docs.typesafe.ai/models)
- [TypeSafe API contract](https://docs.typesafe.ai/api)
- [TypeSafe confidence semantics](https://docs.typesafe.ai/confidence)
- [AI SDK 7.0.103 release](https://github.com/vercel/ai/releases/tag/ai%407.0.103)
- [AI SDK 7.0.104 release](https://github.com/vercel/ai/releases/tag/ai%407.0.104)
- [AI SDK 7.0.105 release](https://github.com/vercel/ai/releases/tag/ai%407.0.105)
- [Vercel Jev integration](https://vercel.com/ai-gateway/models/jev)
