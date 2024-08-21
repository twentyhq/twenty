import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useDataExplorerQueryField } from '@/object-record/record-field/meta-types/hooks/useDataExplorerQueryField';
import { RecordDetailSection } from '@/object-record/record-show/record-detail-section/components/RecordDetailSection';
import { RecordDetailSectionHeader } from '@/object-record/record-show/record-detail-section/components/RecordDetailSectionHeader';

type RecordDetailDataExplorerQuerySectionProps = {
  loading: boolean;
};

export const RecordDetailDataExplorerQuerySection = ({
  loading,
}: RecordDetailDataExplorerQuerySectionProps) => {
  const { recordId } = useContext(FieldContext);

  const {
    draftValue,
    setDraftValue,
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
    sourceObjectNameSingular,
  } = useDataExplorerQueryField();

  const persistField = usePersistField();

  const testValue = { sourceObjectMetadataId: 'test' };

  return (
    <RecordDetailSection>
      <RecordDetailSectionHeader title="Data explorer query" />
      fieldValue: {JSON.stringify(fieldValue)}
      <button
        onClick={async () => {
          setFieldValue(testValue);
        }}
      >
        Set test fieldValue
      </button>
      <button
        onClick={() => {
          persistField(testValue);
        }}
      >
        Persist
      </button>
    </RecordDetailSection>
  );
};
