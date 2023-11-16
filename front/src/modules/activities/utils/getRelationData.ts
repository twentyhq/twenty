import { v4 } from 'uuid';

import { ActivityTargetCreateManyActivityInput } from '~/generated/graphql';

import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';

export const getRelationData = (
  entities: ActivityTargetableEntity[],
): ActivityTargetCreateManyActivityInput[] => {
  const now = new Date().toISOString();

  const relationData: ActivityTargetCreateManyActivityInput[] = [];
  for (const entity of entities ?? []) {
    relationData.push({
      companyId: entity.type === 'Company' ? entity.id : null,
      personId: entity.type === 'Person' ? entity.id : null,
      id: v4(),
      createdAt: now,
    });
    if (entity.relatedEntities) {
      for (const relatedEntity of entity.relatedEntities ?? []) {
        relationData.push({
          companyId: relatedEntity.type === 'Company' ? relatedEntity.id : null,
          personId: relatedEntity.type === 'Person' ? relatedEntity.id : null,
          id: v4(),
          createdAt: now,
        });
      }
    }
  }
  return relationData;
};
