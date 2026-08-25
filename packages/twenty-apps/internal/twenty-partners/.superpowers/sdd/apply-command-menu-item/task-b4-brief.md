# Task B4 — close the single-record throw trap everywhere

## Why

`twenty-client-sdk` THROWS `Error: Record not found` (core.mjs:243) when a single-record
query resolves nothing. It does not return null. That defect already cost us one live bug on
the apply route: the guard `if (!brief) return errorResponse('BRIEF_NOT_OPEN')` was
unreachable, so a missing brief surfaced as the opaque "Something went wrong" message.

Task B1 fixed the two apply queries. A sweep of `src/**/graphql/**` found SIX read queries
still using the single-record form. Every one of their callers already reads the result with
optional chaining (`?.partnerUserId`), so the code is already written as if absence were a
normal branch — the throw is the part that does not match.

Mutations are NOT in scope. A mutation targets a known id and a throw there is correct.

## The queries to convert

| File | Field |
|---|---|
| `src/modules/application/graphql/queries/find-application-with-relations.ts` | `application` |
| `src/modules/opportunity/matching/graphql/queries/get-company-partner-user.ts` | `company` |
| `src/modules/opportunity/matching/graphql/queries/get-opportunity-cascade-fields.ts` | `opportunity` |
| `src/modules/partner/onboarding/graphql/queries/get-company-partner-user.ts` | `company` |
| `src/modules/shared/graphql/queries/get-child-partner-user.ts` | 4 functions: `partnerLink`, `partnerService`, `partnerContent`, `application` |
| `src/modules/shared/graphql/queries/get-partner-owner.ts` | `partner` |

Convert each to the plural list form, exactly the way `find-duplicate-application.ts` and the
B1-fixed `find-opportunity-for-apply.ts` already do:

    companies(filter: { id: { eq: companyId } }, first: 1) { edges { node { ... } } }

A list query returns an empty `edges` array for a missing record instead of throwing.

## Return shapes — follow the file's existing convention, do not unify them

- `get-child-partner-user.ts` already unwraps inside the query function
  (`.then((res) => res.partnerLink)`). Keep that: unwrap to
  `res.partnerLinks?.edges?.[0]?.node ?? null`. Its callers then need NO change.
- The other five return the raw result and let the caller unwrap. Keep that: the caller moves
  from `result.company?.partnerUserId` to
  `result.companies?.edges?.[0]?.node?.partnerUserId`.

Add ONE short `//` comment per converted file, in the shape B1 used:
`// List form on purpose: the single-record read throws \`Record not found\` for an unknown id.`
No other comments.

## Call sites to update

- `src/modules/application/on-application-set-name.logic-function.ts:24`
- `src/modules/opportunity/matching/services/propagate-partner-user.service.ts` lines ~73, ~98, ~117, ~130
- `src/modules/partner/onboarding/services/link-partner-user.service.ts` lines ~53, ~77
- `src/modules/partner/self-service/services/stamp-partner-user-on-child.service.ts` line ~34
  (the `read:` map entries at lines 22-25 need no change if you keep get-child-partner-user's
  unwrapping convention)
- `src/modules/application/services/resolve-candidacy.service.ts:34`

Preserve each caller's existing behaviour on absence. They already branch on it — do not
change what they do, only where the value is read from.

## Tests

These mock the OLD single-record response shape and will fail until updated. Update the mocks
to the list shape; do not weaken an assertion to make one pass:

- `src/modules/application/__tests__/on-application-set-name.test.ts`
- `src/modules/application/__tests__/on-application-created.test.ts`
- `src/modules/partner/self-service/services/stamp-partner-user-on-child.test.ts`
- `src/modules/partner/onboarding/services/link-partner-user.service.test.ts`
- any other unit test that fails for this reason

Then ADD one regression test per converted query module (or one per service that reads them,
whichever fits the existing test layout): the mocked query resolves an EMPTY edges array and
the caller takes its absence branch without throwing. Without these the trap can silently
come back — the old tests all passed while the bug was live, because a mocked client returns
null where the real SDK throws.

## Constraints

- Repo rules: named exports, `types` over `interface`, no `any`, short `//` comments only.
- Use `isDefined` / `isNonEmptyString` from the existing shared helpers rather than new guards.
- Do NOT touch mutations, `partner.role.ts`, `configure-partner-rls.ts`, the front component,
  the command menu item, or anything under `src/scripts/`.
- Do NOT change the app version in package.json — the controller handles the bump.

## Report

Run `npx tsc -p tsconfig.json --noEmit`, `yarn test:unit`, `yarn lint`. Commit with a
conventional-commit message and NO AI attribution. Reply in under 12 lines: status, commit
SHA, one-line test summary, how many regression tests you added, and anything you found that
this brief did not anticipate.
