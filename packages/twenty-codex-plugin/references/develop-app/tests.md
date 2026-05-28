# Tests

Tests use the `*.spec.ts` extension and live in sibling `__tests__/` folders next to the code they cover, matching Twenty backend conventions. Write them where `yarn twenty dev --once` does not validate correctness.

## What To Test

- Parsers in `src/utils/` — every branch of foreign API shape handling, including missing fields and empty responses.
- Mappers in `src/utils/` — foreign-to-Twenty mapping, including the "no match" case.
- Post-install hooks — at minimum, idempotency: run twice, assert state is identical.
- Side effects (billing, external state) — assert they fire only on the conditions the code claims.

## What To Skip

- Entity definitions (`*.field.ts`, `*.object.ts`) — sync validates these.
- Front components — verify in the browser.

## Running Tests

Do not run `yarn test` from the Codex sandbox; it hits the Node/Yarn mismatch. Write the files; the user or CI runs them.
