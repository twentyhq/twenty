/* @license Enterprise */

import { type RelatedRecordPathManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatRelatedRecordPath } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-related-record-path.type';

export const fromFlatRelatedRecordPathToRelatedRecordPathManifest = ({
  flatRelatedRecordPath,
}: {
  flatRelatedRecordPath: Pick<
    UniversalFlatRelatedRecordPath,
    | 'universalIdentifier'
    | 'objectMetadataUniversalIdentifier'
    | 'firstFieldMetadataUniversalIdentifier'
    | 'secondFieldMetadataUniversalIdentifier'
    | 'thirdFieldMetadataUniversalIdentifier'
    | 'isInherent'
  >;
}): RelatedRecordPathManifest => ({
  universalIdentifier: flatRelatedRecordPath.universalIdentifier,
  objectUniversalIdentifier:
    flatRelatedRecordPath.objectMetadataUniversalIdentifier,
  firstFieldMetadataUniversalIdentifier:
    flatRelatedRecordPath.firstFieldMetadataUniversalIdentifier,
  ...(isDefined(flatRelatedRecordPath.secondFieldMetadataUniversalIdentifier)
    ? {
        secondFieldMetadataUniversalIdentifier:
          flatRelatedRecordPath.secondFieldMetadataUniversalIdentifier,
      }
    : {}),
  ...(isDefined(flatRelatedRecordPath.thirdFieldMetadataUniversalIdentifier)
    ? {
        thirdFieldMetadataUniversalIdentifier:
          flatRelatedRecordPath.thirdFieldMetadataUniversalIdentifier,
      }
    : {}),
  isInherent: flatRelatedRecordPath.isInherent,
});
