export type ElementLike = {
  childNodes?: ArrayLike<unknown>;
  getAttribute?: (attributeName: string) => string | null;
};
