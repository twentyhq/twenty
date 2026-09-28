# All 20 workflow step types

A separate example app for inspecting the SDK definition and workflow graph. Requires the SDK/server from PR #26662 and the core workflow feature flag. The workflow is app-owned and read-only in the workflow editor.

The definition is in `src/workflows/all-steps.workflow.ts`. It includes every current action type exactly once, a conditional branch, and a two-item iterator with a delay inside it. Both branches rejoin at the app agent. The code action references `prepare-demo.function.ts`, the exposed function action references `greet.function.ts`, and the agent action references `demo.agent.ts`.

Installation creates the definition; it does not run the workflow. Email and calendar actions require a connected account. The form defaults to skipping that branch and uses an example recipient. AI/classification require AI configuration and credits. The HTTP branch contacts example.com. Calendar dates are examples to replace before use.

The agent needs an enabled AI provider, such as OpenAI. Classify specifically requires `TYPESAFE_AI_API_KEY` and the Jev model; an OpenAI key alone does not enable it.

`loop-validation.workflow.ts` installs a separate diagnostic workflow using the gallery's create, iterator, delay, delete, and finish steps. It verifies both loop iterations and cleanup without requiring AI or email providers.

Running the demo creates, updates, upserts, reads and finally deletes its own newly created company. The delete step references the create step's result, never an existing selected company. If the run stops before cleanup, the uniquely named demo company remains for manual cleanup. The agent role grants no record access. Existing workflow execution permissions still apply.

Build the branch SDK, configure a local CLI remote and run `twenty dev` from this directory to install it. Open **All 20 step types — app demo** in Workflows. No automated triggers are included.
