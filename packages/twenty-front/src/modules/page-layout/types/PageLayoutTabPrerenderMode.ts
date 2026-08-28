// hidden-activity: prerendered inside <Activity mode="hidden">, so suspense
// queries prefetch during render while effects (SSE subscriptions, workers)
// stay unmounted until the tab is shown.
// offscreen-mounted: prerendered CSS-hidden with effects mounted, for
// workspace-installed application content that must fully boot while hidden.
export type PageLayoutTabPrerenderMode =
  | 'hidden-activity'
  | 'offscreen-mounted'
  | 'not-prerenderable';
