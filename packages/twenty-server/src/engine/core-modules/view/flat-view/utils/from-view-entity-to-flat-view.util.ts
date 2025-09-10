import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { VIEW_ENTITY_RELATION_PROPERTIES } from 'src/engine/core-modules/view/flat-view/constants/view-entity-relation-properties.constant';
import { type FlatView } from 'src/engine/core-modules/view/flat-view/types/flat-view.type';

export const fromViewEntityToFlatView = (viewEntity: ViewEntity): FlatView => {
  const viewEntityWithoutRelations = removePropertiesFromRecord(
    viewEntity,
    VIEW_ENTITY_RELATION_PROPERTIES,
  );

  return {
    ...viewEntityWithoutRelations,
    universalIdentifier:
      viewEntityWithoutRelations.universalIdentifier ??
      viewEntityWithoutRelations.id,
    viewFieldIds: viewEntity.viewFields?.map((viewField) => viewField.id) ?? [],
  };
};
