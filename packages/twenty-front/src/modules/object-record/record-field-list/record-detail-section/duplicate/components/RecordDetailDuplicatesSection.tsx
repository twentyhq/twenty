import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { useOpenMergeRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenMergeRecordsPageInSidePanel';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindDuplicateRecords } from '@/object-record/hooks/useFindDuplicateRecords';
import { RecordDetailRecordsListContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListContainer';
import { RecordDetailRecordsListItemContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailRecordsListItemContainer';
import { RecordDetailSectionContainer } from '@/object-record/record-field-list/record-detail-section/components/RecordDetailSectionContainer';

import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowMerge } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

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

  const { results: queryResults, error } = useFindDuplicateRecords({
    objectRecordIds: [objectRecordId],
    objectNameSingular,
    skip: !isDefined(objectMetadataItem.duplicateCriteria),
  });

  const duplicateRecords = queryResults?.[0] ?? [];
  const duplicateRecordIds = [
    ...duplicateRecords.map((record) => record.id),
    objectRecordId,
  ];

  const { openMergeRecordsPageInSidePanel } =
    useOpenMergeRecordsPageInSidePanel({
      objectNameSingular,
      objectRecordIds: duplicateRecordIds,
    });

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />
      {isNonEmptyArray(duplicateRecords) && (
        <RecordDetailSectionContainer
          title={t`Duplicates`}
          rightAdornment={
            <LightIconButton
              className="displayOnHover"
              emphasis="subtle"
              onClick={openMergeRecordsPageInSidePanel}
              aria-label={t`Merge duplicates`}
            >
              <IconArrowMerge />
            </LightIconButton>
          }
        >
          <RecordDetailRecordsListContainer>
            {duplicateRecords.slice(0, 5).map((duplicateRecord) => (
              <RecordDetailRecordsListItemContainer key={duplicateRecord.id}>
                <RecordChip
                  record={duplicateRecord}
                  objectNameSingular={objectNameSingular}
                />
              </RecordDetailRecordsListItemContainer>
            ))}
          </RecordDetailRecordsListContainer>
        </RecordDetailSectionContainer>
      )}
    </>
  );
};
