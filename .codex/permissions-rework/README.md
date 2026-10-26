# Record permissions product branch

The implementation, design, tests, and investigation evidence are collected on
`codex/record-permissions`.

- [Design](../../design-doc-record-permissions.md)
- [Implementation decisions and remaining limitations](../../record-permissions-implementation-decisions.md)
- [Latest QA summary](product/qa-verification-results.json)
- [Member-city RLS verification](product/qa-city-rls-results.json)

`bench/` preserves the storage-strategy experiments. `product/` contains API and
browser verification, performance measurements, and scripts used during the work.
Reports include failed and intermediate attempts; use the QA summary and
implementation decisions to distinguish those from the final checks. In
particular, `compiler-benchmark.ts` is an early investigation runner, not the
final performance acceptance test. The maintained performance tests live beside
the server implementation.

The policy snapshots, fixture identifiers, and city-test oracle describe the local
seeded workspace. They are evidence, not portable workspace provisioning. The
city-test script changes that workspace's member city and fixture relationships,
then restores them. Local database contents and environment credentials are not
part of the Git branch.

The branch remains a product evaluation artifact behind feature flags. The dense
access-group distribution and neighboring-tenant contention limitations documented
in the implementation decisions remain open; collecting the work on this branch
does not establish production performance acceptance.
