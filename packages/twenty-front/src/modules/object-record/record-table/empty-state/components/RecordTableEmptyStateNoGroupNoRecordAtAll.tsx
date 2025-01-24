import { IconPlus } from 'twenty-ui';

import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
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

  const title = `Add your first ${objectLabel}`;

  const subTitle = `Use our API or add your first ${objectLabel} manually`;

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
