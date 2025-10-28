import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { hasInitializedCurrentRecordFieldsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFieldsComponentFamilyState';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarRecordFieldEffect = () => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const currentView = useRecoilValue(
    coreViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const [
    hasInitializedCurrentRecordFields,
    setHasInitializedCurrentRecordFields,
  ] = useRecoilComponentFamilyState(
    hasInitializedCurrentRecordFieldsComponentFamilyState,
    {
      viewId: currentViewId ?? undefined,
    },
  );

  const setCurrentRecordFields = useSetRecoilComponentState(
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
