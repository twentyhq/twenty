# All 20 workflow step types

A separate example app for inspecting the SDK definition and workflow graph. Requires the SDK/server from PR #26662 and both `IS_APPLICATION_WORKFLOWS_ENABLED` and `IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED`. The workflow is app-owned and read-only in the workflow editor.

The definition is in `src/workflows/all-steps.workflow.ts`. It includes every current action type exactly once, a conditional branch, and a two-item iterator with a delay inside it. Both branches rejoin at the app agent. The code action references `prepare-demo.function.ts`, the exposed function action references `greet.function.ts`, and the agent action references `demo.agent.ts`.

Installation creates the definition; it does not run the workflow. Email and calendar actions require a connected account. The form defaults to skipping that branch and uses an example recipient. AI/classification require AI configuration and credits. The HTTP branch contacts example.com. Calendar dates are examples to replace before use.

The agent needs an enabled AI provider, such as OpenAI. Classify specifically requires `TYPESAFE_AI_API_KEY` and the Jev model; an OpenAI key alone does not enable it.

`loop-validation.workflow.ts` installs a separate diagnostic workflow using the gallery's create, iterator, delay, delete, and finish steps. It verifies both loop iterations and cleanup without requiring AI or email providers.

Running the demo creates, updates, upserts, reads and finally deletes its own newly created company. The delete step references the create step's result, never an existing selected company. If the run stops before cleanup, the uniquely named demo company remains for manual cleanup. Workflow steps run under the application's `workflow.role.ts`, limited by the role of the member who starts the run: it grants the demo company access and the email and calendar tools the gallery needs. The agent keeps its own `my.role.ts`, which grants no record access, and is also limited by the run's roles.

Build the branch SDK, configure a local CLI remote and run `twenty dev` from this directory to install it. Open **All 20 step types — app demo** in Workflows. No automated triggers are included.

The CODE step declares an expected result for output inspection; the greeting function declares its output schema. Agent outputs are derived from its response format. These declarations do not execute the integrations during installation. The HTTP example returns HTML rather than a structured object, so it declares no object properties.

Email and calendar steps only use a connected account owned by the member who started the run or shared with the workspace. The email branch is opt-in.
