import { isDefined } from 'twenty-shared/utils';

import { type RelatedRecordPath } from '~/generated-metadata/graphql';

export const getRelatedRecordPathFieldMetadataIds = (
  relatedRecordPath: Pick<
    RelatedRecordPath,
    'firstFieldMetadataId' | 'secondFieldMetadataId' | 'thirdFieldMetadataId'
  >,
): string[] =>
  [
    relatedRecordPath.firstFieldMetadataId,
    relatedRecordPath.secondFieldMetadataId,
    relatedRecordPath.thirdFieldMetadataId,
  ].filter(isDefined);
