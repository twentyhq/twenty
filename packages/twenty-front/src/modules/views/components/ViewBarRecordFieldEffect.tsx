import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValue';
import { hasInitializedCurrentRecordFieldsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFieldsComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarRecordFieldEffect = () => {
  const currentViewId = useAtomComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const currentView = useFamilySelectorValue(coreViewFromViewIdFamilySelector, {
    viewId: currentViewId ?? '',
  });

  const [
    hasInitializedCurrentRecordFields,
    setHasInitializedCurrentRecordFields,
  ] = useAtomComponentFamilyState(
    hasInitializedCurrentRecordFieldsComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFields = useSetAtomComponentState(
    currentRecordFieldsComponentState,
  );

  useEffect(() => {
    if (!hasInitializedCurrentRecordFields && isDefined(currentView)) {
      if (currentView.objectMetadataId !== objectMetadataItem.id) {
        return;
      }

      const recordFields = currentView.viewFields
        .map(mapViewFieldToRecordField)
        .filter(isDefined);

      setCurrentRecordFields(recordFields);

      setHasInitializedCurrentRecordFields(true);
    }
  }, [
    currentViewId,
    setCurrentRecordFields,
    hasInitializedCurrentRecordFields,
    setHasInitializedCurrentRecordFields,
    currentView,
    objectMetadataItem,
  ]);

  return null;
};
