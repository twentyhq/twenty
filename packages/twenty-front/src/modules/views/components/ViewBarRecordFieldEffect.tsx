import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { hasInitializedCurrentRecordFieldsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFieldsComponentFamilyState';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ViewBarRecordFieldEffect = () => {
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const currentView = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const [
    hasInitializedCurrentRecordFields,
    setHasInitializedCurrentRecordFields,
  ] = useAtomComponentFamilyState(
    hasInitializedCurrentRecordFieldsComponentFamilyState,
    {
      viewId: contextStoreCurrentViewId ?? undefined,
    },
  );

  const setCurrentRecordFields = useSetAtomComponentState(
    currentRecordFieldsComponentState,
  );
  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
  );

  useEffect(() => {
    if (!isDefined(currentView)) {
      return;
    }

    if (currentView.objectMetadataId !== objectMetadataItem.id) {
      return;
    }

    const recordFields = currentView.viewFields
      .map(mapViewFieldToRecordField)
      .filter(isDefined);

    if (!isDeeplyEqual(currentRecordFields, recordFields)) {
      setCurrentRecordFields(recordFields);
    }

    if (!hasInitializedCurrentRecordFields) {
      setHasInitializedCurrentRecordFields(true);
    }
  }, [
    contextStoreCurrentViewId,
    currentRecordFields,
    setCurrentRecordFields,
    hasInitializedCurrentRecordFields,
    setHasInitializedCurrentRecordFields,
    currentView,
    objectMetadataItem,
  ]);

  return null;
};
