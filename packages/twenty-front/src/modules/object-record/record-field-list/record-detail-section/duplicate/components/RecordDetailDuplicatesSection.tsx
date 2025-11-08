import { useOpenMergeRecordsPageInCommandMenu } from '@/command-menu/hooks/useOpenMergeRecordsPageInCommandMenu';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindDuplicateRecords } from '@/object-record/hooks/useFindDuplicateRecords';
import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailRecordsListItemContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListItemContainer';
import { RecordDetailSectionContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailSectionContainer';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowMerge } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

export const RecordDetailDuplicatesSection = ({
  objectRecordId,
  objectNameSingular,
}: {
  objectRecordId: string;
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { results: queryResults } = useFindDuplicateRecords({
    objectRecordIds: [objectRecordId],
    objectNameSingular,
    skip: !isDefined(objectMetadataItem.duplicateCriteria),
  });

  const duplicateRecords = queryResults?.[0] ?? [];
  const duplicateRecordIds = [
    ...duplicateRecords.map((record) => record.id),
    objectRecordId,
  ];

  const { openMergeRecordsPageInCommandMenu } =
    useOpenMergeRecordsPageInCommandMenu({
      objectNameSingular,
      objectRecordIds: duplicateRecordIds,
    });

  if (!queryResults || !queryResults[0] || queryResults[0].length === 0)
    return null;

  return (
    <RecordDetailSectionContainer
      title={t`Duplicates`}
      rightAdornment={
        <LightIconButton
          className="displayOnHover"
          Icon={IconArrowMerge}
          accent="tertiary"
          onClick={openMergeRecordsPageInCommandMenu}
        />
      }
    >
      <RecordDetailRecordsListContainer>
        {queryResults[0].slice(0, 5).map((duplicateRecord) => (
          <RecordDetailRecordsListItemContainer key={duplicateRecord.id}>
            <RecordChip
              record={duplicateRecord}
              objectNameSingular={objectNameSingular}
            />
          </RecordDetailRecordsListItemContainer>
        ))}
      </RecordDetailRecordsListContainer>
    </RecordDetailSectionContainer>
  );
};
