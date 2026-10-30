/* @license Enterprise */

import { type RelatedRecordPathManifest } from 'twenty-shared/application';

import { type UniversalFlatRelatedRecordPath } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-related-record-path.type';

export const fromRelatedRecordPathManifestToUniversalFlatRelatedRecordPath = ({
  relatedRecordPathManifest,
  applicationUniversalIdentifier,
  now,
}: {
  relatedRecordPathManifest: RelatedRecordPathManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatRelatedRecordPath => ({
  universalIdentifier: relatedRecordPathManifest.universalIdentifier,
  applicationUniversalIdentifier,
  objectMetadataUniversalIdentifier:
    relatedRecordPathManifest.objectUniversalIdentifier,
  firstFieldMetadataUniversalIdentifier:
    relatedRecordPathManifest.firstFieldMetadataUniversalIdentifier,
  secondFieldMetadataUniversalIdentifier:
    relatedRecordPathManifest.secondFieldMetadataUniversalIdentifier ?? null,
  thirdFieldMetadataUniversalIdentifier:
    relatedRecordPathManifest.thirdFieldMetadataUniversalIdentifier ?? null,
  isInherent: relatedRecordPathManifest.isInherent ?? false,
  createdAt: now,
  updatedAt: now,
});
