import {
  getViewGroupUniversalIdentifier,
  type ViewManifest,
} from 'twenty-shared/application';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeViewGroupPropertiesFromMainGroupByFieldMetadata } from 'src/engine/metadata-modules/flat-view-group/utils/compute-view-group-properties-from-main-group-by-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';

export const fromViewManifestToImplicitUniversalFlatViewGroups = ({
  viewManifest,
  mainGroupByFieldMetadata,
  applicationUniversalIdentifier,
  now,
}: {
  viewManifest: ViewManifest;
  mainGroupByFieldMetadata: FlatFieldMetadata | UniversalFlatFieldMetadata;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatViewGroup[] => {
  const declaredFieldValues = new Set(
    (viewManifest.groups ?? []).map(({ fieldValue }) => fieldValue),
  );

  return computeViewGroupPropertiesFromMainGroupByFieldMetadata({
    mainGroupByFieldMetadata,
  })
    .filter(({ fieldValue }) => !declaredFieldValues.has(fieldValue))
    .map((viewGroupProperties) => ({
      ...viewGroupProperties,
      universalIdentifier: getViewGroupUniversalIdentifier({
        applicationUniversalIdentifier,
        viewUniversalIdentifier: viewManifest.universalIdentifier,
        fieldValue: viewGroupProperties.fieldValue,
      }),
      applicationUniversalIdentifier,
      viewUniversalIdentifier: viewManifest.universalIdentifier,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));
};
