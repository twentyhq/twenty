/**
 * esbuild aliases applied when building user app code (logic functions
 * and front components).
 *
 * `twenty-sdk/define` is an authoring surface whose `defineXxx` helpers
 * only run build-time validation. Its compiled `dist` also transitively
 * imports `zod` (+ every locale) and `@sniptt/guards`. Redirecting to
 * `twenty-sdk/define-runtime-stub` — which exposes passthrough identity
 * versions of the same surface — lets esbuild tree-shake the zod/sniptt
 * dependencies out of user bundles.
 */
export const APP_BUILD_ALIASES: Record<string, string> = {
  'twenty-sdk/define': 'twenty-sdk/define-runtime-stub',
};
