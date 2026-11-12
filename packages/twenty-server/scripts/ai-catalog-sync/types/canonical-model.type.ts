// Structural, so this runs from a checkout that has not installed the monorepo
export type CanonicalModel = { name: string; label?: string } & Record<
  string,
  unknown
>;
