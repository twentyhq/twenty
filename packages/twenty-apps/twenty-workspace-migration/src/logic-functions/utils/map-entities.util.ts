export function mapEntities<T extends { universalIdentifier: string }>(a: T[]) {
  return new Map(a.map(n => [n.universalIdentifier, n]));
}