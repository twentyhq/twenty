import deepEqual from 'deep-equal';
import { isDefined } from 'twenty-shared/utils';

export type EntitiesDiff<T extends { id: string }> = {
  entitiesToCreate: T[];
  entitiesToUpdate: T[];
  idsToDelete: string[];
};

export const computeDiffBetweenExistingEntitiesAndInput = <
  T extends { id: string },
  K extends { id: string },
>(
  existingEntities: T[],
  receivedInputEntities: K[],
  propertiesToCompare: (keyof K & keyof T)[],
): EntitiesDiff<K> => {
  const entitiesToCreate: K[] = [];
  const entitiesToUpdate: K[] = [];

  const existingEntitiesMap = new Map(
    existingEntities.map((entity) => [entity.id, entity]),
  );
  const receivedEntitiesMap = new Map(
    receivedInputEntities.map((entity) => [entity.id, entity]),
  );

  for (const receivedEntity of receivedInputEntities) {
    const existingEntity = existingEntitiesMap.get(receivedEntity.id);

    if (isDefined(existingEntity)) {
      const comparableExistingEntity = propertiesToCompare.reduce(
        (acc, property) => {
          return {
            ...acc,
            [property]: existingEntity[property],
          };
        },
        {},
      );

      const comparableReceivedEntity = propertiesToCompare.reduce(
        (acc, property) => {
          return {
            ...acc,
            [property]: receivedEntity[property],
          };
        },
        {},
      );

      if (!deepEqual(comparableExistingEntity, comparableReceivedEntity)) {
        entitiesToUpdate.push(receivedEntity);
      }
    } else {
      entitiesToCreate.push(receivedEntity);
    }
  }

  const idsToDelete = existingEntities
    .filter((existingEntity) => !receivedEntitiesMap.has(existingEntity.id))
    .map((entity) => entity.id);

  return {
    entitiesToCreate,
    entitiesToUpdate,
    idsToDelete,
  };
};
