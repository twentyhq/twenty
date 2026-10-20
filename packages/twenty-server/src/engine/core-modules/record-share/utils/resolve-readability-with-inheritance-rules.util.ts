/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRecordInheritanceRuleMaps } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule-maps.type';
import { findFlatRecordInheritanceRulesOfObject } from 'src/engine/metadata-modules/flat-record-inheritance-rule/utils/find-flat-record-inheritance-rules-of-object.util';

export const resolveReadabilityWithInheritanceRules = ({
  flatObjectMetadata,
  flatRecordInheritanceRuleMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id' | 'readability'>;
  flatRecordInheritanceRuleMaps: FlatRecordInheritanceRuleMaps | undefined;
}): { readability: MetadataReadability; isOpenWhenDetached: boolean } => {
  const { readability } = flatObjectMetadata;

  const isFollowingRules =
    (readability === MetadataReadability.OPEN ||
      readability === MetadataReadability.PRIVATE) &&
    findFlatRecordInheritanceRulesOfObject({
      objectMetadataId: flatObjectMetadata.id,
      flatRecordInheritanceRuleMaps,
    }).length > 0;

  if (!isFollowingRules) {
    return { readability, isOpenWhenDetached: false };
  }

  return {
    readability: MetadataReadability.INHERITED,
    isOpenWhenDetached: readability === MetadataReadability.OPEN,
  };
};
