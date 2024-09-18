import { IconPlus } from 'twenty-ui';

import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useCreateNewTableRecord } from '@/object-record/record-table/hooks/useCreateNewTableRecords';
import { useContext } from 'react';

export const RecordTableEmptyStateNoRecordAtAll = () => {
  const { createNewTableRecord } = useCreateNewTableRecord();

  const { objectMetadataItem } = useContext(RecordTableContext);

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
      Icon={IconPlus}
      animatedPlaceholderType="noRecord"
      onClick={handleButtonClick}
    />
  );
};
