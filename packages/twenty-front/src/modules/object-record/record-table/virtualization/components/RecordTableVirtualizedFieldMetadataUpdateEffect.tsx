import { lastFieldMetadataItemUpdateState } from '@/object-metadata/states/lastFieldMetadataItemUpdateState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { lastProcessedFieldMetadataUpdateComponentState } from '@/object-record/record-table/virtualization/states/lastProcessedFieldMetadataUpdateComponentState';
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
    lastProcessedFieldMetadataUpdate,
    setLastProcessedFieldMetadataUpdate,
  ] = useRecoilComponentState(lastProcessedFieldMetadataUpdateComponentState);

  useEffect(() => {
    if (!lastFieldMetadataItemUpdate) {
      return;
    }

    if (
      lastFieldMetadataItemUpdate.eventId === lastProcessedFieldMetadataUpdate
    ) {
      return;
    }

    const isFieldInCurrentView = visibleRecordFields.some(
      (field) =>
        field.fieldMetadataItemId ===
        lastFieldMetadataItemUpdate.fieldMetadataItemId,
    );

    if (isFieldInCurrentView) {
      setLastProcessedFieldMetadataUpdate(lastFieldMetadataItemUpdate.eventId);
      resetVirtualizationBecauseDataChanged();
    }
  }, [
    lastFieldMetadataItemUpdate,
    lastProcessedFieldMetadataUpdate,
    setLastProcessedFieldMetadataUpdate,
    visibleRecordFields,
    resetVirtualizationBecauseDataChanged,
  ]);

  return <></>;
};
