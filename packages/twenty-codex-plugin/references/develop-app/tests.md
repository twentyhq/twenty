# Tests

Tests use the `*.spec.ts` extension and live in sibling `__tests__/` folders next to the code they cover, matching Twenty backend conventions. Write them where `yarn twenty dev --once` does not validate correctness.

Always write a test file for every util or function. Whenever you create or modify a file in `src/utils/` (or any other testable function file), you MUST create or update its sibling `__tests__/<name>.spec.ts`. A util or function without a spec file is incomplete.

## File Organization

Write one spec file per util or function source file. Each testable source file gets a dedicated sibling `__tests__/<name>.spec.ts` whose name mirrors the source file. Do not combine multiple utils or functions into a single spec file.

```
src/utils/parse-foo.util.ts
src/utils/__tests__/parse-foo.util.spec.ts
src/utils/map-bar.util.ts
src/utils/__tests__/map-bar.util.spec.ts
```

## What To Test

- Parsers in `src/utils/` — every branch of foreign API shape handling, including missing fields and empty responses.
- Mappers in `src/utils/` — foreign-to-Twenty mapping, including the "no match" case.
- Front-component helpers in `src/front-components/utils/` — selected-record validation, payload builders, logic-function result parsing, summary aggregation, and snackbar message formatting.
- Bulk logic-function normalization — the canonical `records: Array<{ id: string; ...fields }>` shape, including empty arrays and records missing `id`.
- Post-install hooks — at minimum, idempotency: run twice, assert state is identical.
- Side effects (billing, external state) — assert they fire only on the conditions the code claims.

## What To Skip

- Entity definitions (`*.field.ts`, `*.object.ts`) — sync validates these.
- Front component rendering shells — verify in the browser. Extracted helper functions are not rendering shells and must be unit-tested.

## Running Tests

Integration tests build, deploy, install, and uninstall the app on whatever server `TWENTY_API_URL` points to. The scaffold defaults to the dev instance (`http://localhost:2020`), so running them there adds and then removes the app from the workspace you sync to with `yarn twenty dev --once`. Always run them against the isolated test instance instead — a separate container, database, and port (`2021`) that does not affect your running dev instance:

```bash
# Start the isolated test instance (once).
yarn twenty docker:start --test

# Run integration tests against it.
TWENTY_API_URL=http://localhost:2021 yarn test
```

The seeded default `TWENTY_API_KEY` works for both instances, so only the URL needs overriding. This mirrors CI, which spawns the same isolated instance via the `spawn-twenty-app-dev-test` action.

When the user asks you to run tests, do run them. First start or verify the isolated test instance, then run the test command with `TWENTY_API_URL=http://localhost:2021`. Do not run integration tests against `http://localhost:2020` unless the user explicitly asks to target the dev instance. If only unit tests are requested, use the package's unit-test script and no `TWENTY_API_URL` override is needed.
