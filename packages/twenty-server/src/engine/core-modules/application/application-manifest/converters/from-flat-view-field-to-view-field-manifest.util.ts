import { type ViewFieldManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export const fromFlatViewFieldToViewFieldManifest = ({
  flatViewField,
}: {
  flatViewField: FlatViewField;
}): ViewFieldManifest => {
  return {
    universalIdentifier: flatViewField.universalIdentifier,
    fieldMetadataUniversalIdentifier:
      flatViewField.fieldMetadataUniversalIdentifier,
    position: flatViewField.position,
    isVisible: flatViewField.isVisible ?? true,
    size: flatViewField.size ?? 0,
    ...(isDefined(flatViewField.aggregateOperation)
      ? { aggregateOperation: flatViewField.aggregateOperation }
      : {}),
    ...(isDefined(flatViewField.viewFieldGroupUniversalIdentifier)
      ? {
          viewFieldGroupUniversalIdentifier:
            flatViewField.viewFieldGroupUniversalIdentifier,
        }
      : {}),
    ...(flatViewField.isActive === false ? { isActive: false } : {}),
  };
};
