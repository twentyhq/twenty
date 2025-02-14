import { IconPlus } from 'twenty-ui';

import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { getEmptyStateSubTitle } from '@/object-record/record-table/empty-state/utils/getEmptyStateSubTitle';
import { getEmptyStateTitle } from '@/object-record/record-table/empty-state/utils/getEmptyStateTitle';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';

export const RecordTableEmptyStateNoGroupNoRecordAtAll = () => {
  const { objectMetadataItem, recordTableId } = useRecordTableContextOrThrow();

  const { createNewTableRecord } = useCreateNewTableRecord({
    objectMetadataItem,
    recordTableId,
  });

  const handleButtonClick = () => {
    createNewTableRecord();
  };

  const objectLabel = useObjectLabel(objectMetadataItem);

  const buttonTitle = `Add a ${objectLabel}`;

  const title = getEmptyStateTitle(
    objectMetadataItem.nameSingular,
    objectLabel,
  );

  const subTitle = getEmptyStateSubTitle(
    objectMetadataItem.nameSingular,
    objectLabel,
  );

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={buttonTitle}
      subTitle={subTitle}
      title={title}
      ButtonIcon={IconPlus}
      animatedPlaceholderType="noRecord"
      onClick={handleButtonClick}
    />
  );
};
