import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui';

export const RecordTableEmptyStateReadOnly = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const objectLabel = useObjectLabel(objectMetadataItem);

  const buttonTitle = `Add a ${objectLabel}`;

  return (
    <RecordTableEmptyStateDisplay
      title={t`No records found`}
      subTitle={t`You are not allowed to create records in this object`}
      animatedPlaceholderType="noRecord"
      buttonTitle={buttonTitle}
      ButtonIcon={IconPlus}
      buttonIsDisabled={true}
    />
  );
};
