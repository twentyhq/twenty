import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const findObjectNameByUniversalIdentifier = (
  universalIdentifier: string,
): string | undefined => {
  for (const [objectName, objectDefinition] of Object.entries(
    STANDARD_OBJECTS,
  )) {
    if (objectDefinition.universalIdentifier === universalIdentifier) {
      return objectName;
    }
  }

  return undefined;
};
