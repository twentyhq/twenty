export const createIdToUniversalIdentifierMap = (
  entities: { id: string; universalIdentifier: string }[],
): Map<string, string> => {
  const map = new Map<string, string>();

  for (const entity of entities) {
    map.set(entity.id, entity.universalIdentifier);
  }

  return map;
};
