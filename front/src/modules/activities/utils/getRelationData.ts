import { v4 } from 'uuid';

import { ActivityTargetCreateManyActivityInput } from '~/generated/graphql';

import {
  ActivityTargetableEntity,
  ActivityTargetableEntityType,
} from '../types/ActivityTargetableEntity';

export function getRelationData(
  entities: ActivityTargetableEntity[],
): ActivityTargetCreateManyActivityInput[] {
  const now = new Date().toISOString();

  let relationData: ActivityTargetCreateManyActivityInput[] = [];
  for (const entity of entities ?? []) {
    relationData.push({
      companyId:
        entity.type === ActivityTargetableEntityType.Company ? entity.id : null,
      personId:
        entity.type === ActivityTargetableEntityType.Person ? entity.id : null,
      id: v4(),
      createdAt: now,
    });
    if (entity.relatedEntities) {
      relationData = relationData.concat(
        getRelationData(entity.relatedEntities),
      );
    }
  }
  return relationData;
}
