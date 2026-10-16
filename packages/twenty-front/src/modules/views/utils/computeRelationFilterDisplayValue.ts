import { t } from '@lingui/core/macro';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { MAX_RECORDS_TO_DISPLAY } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordSelect';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const computeRelationFilterDisplayValue = ({
  targetObjectMetadataItems,
  selectedRecordsByObjectNamePlural,
  isCurrentWorkspaceMemberSelected,
}: {
  targetObjectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'namePlural' | 'labelPlural' | 'fields' | 'labelIdentifierFieldMetadataId'
  >[];
  selectedRecordsByObjectNamePlural: Record<string, ObjectRecord[]>;
  isCurrentWorkspaceMemberSelected: boolean;
}): string => {
  const selectedRecordNames = targetObjectMetadataItems.flatMap(
    (targetObjectMetadataItem) =>
      (
        selectedRecordsByObjectNamePlural[
          targetObjectMetadataItem.namePlural
        ] ?? []
      ).map((record) =>
        getLabelIdentifierFieldValue(
          record,
          getLabelIdentifierFieldMetadataItem(targetObjectMetadataItem),
        ),
      ),
  );

  const labelValueItems = [
    ...(isCurrentWorkspaceMemberSelected ? [t`Me`] : []),
    ...selectedRecordNames,
  ];

  if (labelValueItems.length <= MAX_RECORDS_TO_DISPLAY) {
    return labelValueItems.join(', ');
  }

  const relationObjectLabelPlural =
    targetObjectMetadataItems.length === 1
      ? targetObjectMetadataItems[0].labelPlural.toLowerCase()
      : t`records`;

  return `${labelValueItems.length} ${relationObjectLabelPlural}`;
};
