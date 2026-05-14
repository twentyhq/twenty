# Logic

Use this reference for Twenty app logic functions, skills, agents, and connection providers.

## Logic Functions

Logic functions should be narrow, observable, and explicit about side effects.

When adding logic:

- Keep the trigger, inputs, writes, and external calls easy to identify.
- Validate required fields before making writes or remote calls.
- Avoid hiding customer-impacting side effects behind UI-only actions.
- Prefer idempotent behavior for jobs or repeated invocations.

## Skills And Agents

Skills and agents should describe when they apply, what context they need, and what output is expected.

When adding AI behavior:

- Make trigger rules concrete.
- Keep instructions grounded in available app data and tools.
- State when the agent should ask for missing workspace or record context.
- Avoid exposing raw IDs, timestamps, or nested API output to end users when a readable answer is possible.

## Connection Providers

For third-party connections:

- Keep secrets out of source and public assets.
- Document required OAuth or API setup in the app README or listing.
- Verify failure states for expired or missing credentials.
