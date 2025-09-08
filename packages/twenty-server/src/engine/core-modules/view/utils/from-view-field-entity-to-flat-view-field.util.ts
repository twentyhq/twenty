import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import {
  viewFieldEntityRelationProperties,
  type FlatViewField,
} from 'src/engine/core-modules/view/types/flat-view-field.type';

export const fromViewFieldEntityToFlatViewField = (
  viewFieldEntity: ViewFieldEntity,
): FlatViewField => {
  const viewFieldEntityWithoutRelations = removePropertiesFromRecord(
    viewFieldEntity,
    viewFieldEntityRelationProperties,
  );

  return {
    ...viewFieldEntityWithoutRelations,
    universalIdentifier:
      viewFieldEntityWithoutRelations.universalIdentifier ??
      viewFieldEntityWithoutRelations.id,
  };
};
