import { lastFieldMetadataItemUpdateState } from '@/object-metadata/states/lastFieldMetadataItemUpdateState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { lastProcessedFieldMetadataUpdateIdComponentState } from '@/object-record/record-table/virtualization/states/lastProcessedFieldMetadataUpdateIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

export const RecordTableVirtualizedFieldMetadataUpdateEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const lastFieldMetadataItemUpdate = useRecoilValue(
    lastFieldMetadataItemUpdateState,
  );

  const [
    lastProcessedFieldMetadataUpdateId,
    setLastProcessedFieldMetadataUpdateId,
  ] = useRecoilComponentState(lastProcessedFieldMetadataUpdateIdComponentState);

  useEffect(() => {
    if (!lastFieldMetadataItemUpdate) {
      return;
    }

    if (lastFieldMetadataItemUpdate.id === lastProcessedFieldMetadataUpdateId) {
      return;
    }

    const isFieldInCurrentView = visibleRecordFields.some(
      (field) =>
        field.fieldMetadataItemId ===
        lastFieldMetadataItemUpdate.fieldMetadataItemId,
    );

    if (isFieldInCurrentView) {
      setLastProcessedFieldMetadataUpdateId(lastFieldMetadataItemUpdate.id);
      resetVirtualizationBecauseDataChanged();
    }
  }, [
    lastFieldMetadataItemUpdate,
    lastProcessedFieldMetadataUpdateId,
    setLastProcessedFieldMetadataUpdateId,
    visibleRecordFields,
    resetVirtualizationBecauseDataChanged,
  ]);

  return <></>;
};
