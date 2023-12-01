import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';

export const getTargetableEntitiesWithParents = (
  entities: ActivityTargetableEntity[],
): ActivityTargetableEntity[] => {
  const entitiesWithRelations: ActivityTargetableEntity[] = [];
  for (const entity of entities ?? []) {
    entitiesWithRelations.push(entity);
    if (entity.relatedEntities) {
      for (const relatedEntity of entity.relatedEntities ?? []) {
        entitiesWithRelations.push(relatedEntity);
      }
    }
  }
  return entitiesWithRelations;
};
