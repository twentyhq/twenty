import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { VIEW_FIELD_ENTITY_RELATION_PROPERTIES } from 'src/engine/core-modules/view/flat-view/constants/view-field-entity-relation-properties.constant';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';

export const fromViewFieldEntityToFlatViewField = (
  viewFieldEntity: ViewFieldEntity,
): FlatViewField => {
  const viewFieldEntityWithoutRelations = removePropertiesFromRecord(
    viewFieldEntity,
    VIEW_FIELD_ENTITY_RELATION_PROPERTIES,
  );

  return {
    ...viewFieldEntityWithoutRelations,
    universalIdentifier:
      viewFieldEntityWithoutRelations.universalIdentifier ??
      viewFieldEntityWithoutRelations.id,
  };
};
