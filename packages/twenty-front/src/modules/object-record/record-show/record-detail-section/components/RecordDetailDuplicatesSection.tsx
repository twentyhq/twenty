import { useOpenMergeRecordsPageInCommandMenu } from '@/command-menu/hooks/useOpenMergeRecordsPageInCommandMenu';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindDuplicateRecords } from '@/object-record/hooks/useFindDuplicateRecords';
import { RecordDetailRecordsList } from '@/object-record/record-show/record-detail-section/components/RecordDetailRecordsList';
import { RecordDetailRecordsListItem } from '@/object-record/record-show/record-detail-section/components/RecordDetailRecordsListItem';
import { RecordDetailSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailSection';
import { RecordDetailSectionHeader } from '@/object-record/record-show/record-detail-section/components/RecordDetailSectionHeader';

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
    <RecordDetailSection>
      <RecordDetailSectionHeader
        title="Duplicates"
        rightAdornment={
          <LightIconButton
            className="displayOnHover"
            Icon={IconArrowMerge}
            accent="tertiary"
            onClick={openMergeRecordsPageInCommandMenu}
          />
        }
      />
      <RecordDetailRecordsList>
        {queryResults[0].slice(0, 5).map((duplicateRecord) => (
          <RecordDetailRecordsListItem key={duplicateRecord.id}>
            <RecordChip
              record={duplicateRecord}
              objectNameSingular={objectNameSingular}
            />
          </RecordDetailRecordsListItem>
        ))}
      </RecordDetailRecordsList>
    </RecordDetailSection>
  );
};
