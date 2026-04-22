/**
 * Production-only safety net for `fixturePage`-style payloads on logic
 * functions that double as integration-test fixtures.
 *
 * The fetch-* logic functions accept an inline `fixturePage` to seed
 * deterministic data in tests. On a live workspace any authenticated caller
 * could otherwise inject arbitrary "synced" records via the same route, so
 * we only honour fixtures when `NODE_ENV !== 'production'`.
 */
export function isFixtureAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}
