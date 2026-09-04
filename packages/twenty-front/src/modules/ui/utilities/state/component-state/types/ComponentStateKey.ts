export type ComponentStateKey = {
  instanceId: string;
  // The workspace surface asking for the state. Every key carries it; each state
  // decides what to do with it from its context's ComponentSurfaceScope, so a
  // reader and a writer of the same atom can never disagree about scoping.
  surfaceId: string;
};
