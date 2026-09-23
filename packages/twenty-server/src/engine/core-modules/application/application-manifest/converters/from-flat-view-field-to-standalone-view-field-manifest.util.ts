import { type StandaloneViewFieldManifest } from 'twenty-shared/application';

import { fromFlatViewFieldToViewFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-field-to-view-field-manifest.util';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const fromFlatViewFieldToStandaloneViewFieldManifest = ({
  flatViewField,
}: {
  flatViewField: UniversalFlatViewField;
}): StandaloneViewFieldManifest => {
  const { universalIdentifier, ...viewFieldManifest } =
    fromFlatViewFieldToViewFieldManifest({ flatViewField });

  return {
    universalIdentifier,
    viewUniversalIdentifier: flatViewField.viewUniversalIdentifier,
    ...viewFieldManifest,
  };
};
