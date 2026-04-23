import { lastFieldMetadataItemUpdateState } from '@/object-metadata/states/lastFieldMetadataItemUpdateState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { lastProcessedFieldMetadataUpdateIdComponentState } from '@/object-record/record-table/virtualization/states/lastProcessedFieldMetadataUpdateIdComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';

export const RecordTableVirtualizedFieldMetadataUpdateEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const lastFieldMetadataItemUpdate = useAtomStateValue(
    lastFieldMetadataItemUpdateState,
  );

  const [
    lastProcessedFieldMetadataUpdateId,
    setLastProcessedFieldMetadataUpdateId,
  ] = useAtomComponentState(lastProcessedFieldMetadataUpdateIdComponentState);

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

    if (isFieldInCurrentView === true) {
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
