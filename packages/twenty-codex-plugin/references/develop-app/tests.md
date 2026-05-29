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
- Post-install hooks — at minimum, idempotency: run twice, assert state is identical.
- Side effects (billing, external state) — assert they fire only on the conditions the code claims.

## What To Skip

- Entity definitions (`*.field.ts`, `*.object.ts`) — sync validates these.
- Front components — verify in the browser.

## Running Tests

Do not run `yarn test` from the Codex sandbox; it hits the Node/Yarn mismatch. Write the files; the user or CI runs them.
