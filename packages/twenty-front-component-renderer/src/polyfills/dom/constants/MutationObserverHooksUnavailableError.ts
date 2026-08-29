export const MUTATION_OBSERVER_HOOKS_UNAVAILABLE_ERROR =
  '[twenty-front-component] The @remote-dom polyfill hooks could not be resolved, so MutationObserver was not installed. The sandbox keeps the @remote-dom stub, which has no observe method, and any component calling observer.observe will throw.';
