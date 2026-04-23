import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';

export const RecordTableEmptyStateReadOnly = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const objectLabelSingular = useObjectLabel(objectMetadataItem);

  const buttonTitle = `Add a ${objectLabelSingular}`;

  return (
    <RecordTableEmptyStateDisplay
      title={t`No records found`}
      subTitle={t`You are not allowed to create records for this object`}
      animatedPlaceholderType="noRecord"
      buttonTitle={buttonTitle}
      ButtonIcon={IconPlus}
      buttonIsDisabled={true}
    />
  );
};
