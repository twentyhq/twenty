import { lastFieldMetadataItemUpdateState } from '@/object-metadata/states/lastFieldMetadataItemUpdateState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { lastProcessedFieldMetadataUpdateIdComponentState } from '@/object-record/record-table/virtualization/states/lastProcessedFieldMetadataUpdateIdComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useEffect } from 'react';

export const RecordTableVirtualizedFieldMetadataUpdateEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const visibleRecordFields = useRecoilComponentSelectorValueV2(
    visibleRecordFieldsComponentSelector,
  );

  const lastFieldMetadataItemUpdate = useRecoilValueV2(
    lastFieldMetadataItemUpdateState,
  );

  const [
    lastProcessedFieldMetadataUpdateId,
    setLastProcessedFieldMetadataUpdateId,
  ] = useRecoilComponentStateV2(
    lastProcessedFieldMetadataUpdateIdComponentState,
  );

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
