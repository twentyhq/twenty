import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { hasInitializedCurrentRecordFieldsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFieldsComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarRecordFieldEffect = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const currentView = useFamilySelectorValueV2(
    coreViewFromViewIdFamilySelector,
    { viewId: currentViewId ?? '' },
  );

  const [
    hasInitializedCurrentRecordFields,
    setHasInitializedCurrentRecordFields,
  ] = useRecoilComponentFamilyStateV2(
    hasInitializedCurrentRecordFieldsComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFields = useSetRecoilComponentStateV2(
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
