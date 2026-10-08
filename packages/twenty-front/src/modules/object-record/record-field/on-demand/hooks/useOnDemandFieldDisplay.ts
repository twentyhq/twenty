import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isObjectReadOnly } from '@/object-record/read-only/utils/isObjectReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { useLoadOnDemandFieldValue } from '@/object-record/record-field/on-demand/hooks/useLoadOnDemandFieldValue';
import { type OnDemandFieldLoadResult } from '@/object-record/record-field/on-demand/types/OnDemandFieldLoadResult';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { atom, useAtomValue, useStore } from 'jotai';
import { useCallback, useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useOnDemandFieldDisplay = () => {
  const {
    recordId,
    fieldDefinition,
    isForbidden,
    isRecordFieldReadOnly: isReadOnly,
  } = useContext(FieldContext);
  const store = useStore();
  const { loadOnDemandFieldValue } = useLoadOnDemandFieldValue();
  const [displayState] = useState(() =>
    atom<{ loadStatus: 'closed' | 'loading' | OnDemandFieldLoadResult }>({
      loadStatus: 'closed',
    }),
  );
  const { loadStatus } = useAtomValue(displayState);

  const openOnDemandField = async () => {
    if (store.get(displayState).loadStatus === 'loading') {
      return;
    }

    if (isForbidden) {
      store.set(displayState, { loadStatus: 'forbidden' });
      return;
    }

    const objectNameSingular =
      fieldDefinition.metadata.objectMetadataNameSingular;

    if (!isDefined(objectNameSingular)) {
      store.set(displayState, { loadStatus: 'error' });
      return;
    }

    const loadingState: { loadStatus: 'loading' } = { loadStatus: 'loading' };
    const focusIdAtRequest = store.get(currentFocusIdSelector.atom);
    store.set(displayState, loadingState);

    const result = await loadOnDemandFieldValue({
      objectNameSingular,
      recordId,
      fieldMetadataId: fieldDefinition.fieldMetadataId,
    });

    if (store.get(displayState) !== loadingState) {
      return;
    }

    if (store.get(currentFocusIdSelector.atom) !== focusIdAtRequest) {
      store.set(displayState, { loadStatus: 'closed' });
      return;
    }

    store.set(displayState, { loadStatus: result });

    if (result !== 'loaded') {
      return;
    }

    const objectMetadataItem = store.get(
      objectMetadataItemFamilySelector.selectorFamily({
        objectName: objectNameSingular,
        objectNameType: 'singular',
      }),
    );
    const fieldMetadataItem = objectMetadataItem?.readableFields.find(
      (field) => field.id === fieldDefinition.fieldMetadataId && field.isActive,
    );

    if (!isDefined(objectMetadataItem) || !isDefined(fieldMetadataItem)) {
      store.set(displayState, { loadStatus: 'forbidden' });
      return;
    }

    const objectPermissionsByObjectMetadataId = store.get(
      objectPermissionsByObjectMetadataIdSelector.atom,
    );

    return {
      isReadOnly: isRecordFieldReadOnly({
        isRecordReadOnly:
          isReadOnly ||
          isObjectReadOnly({
            isLayoutCustomizationModeEnabled: store.get(
              isLayoutCustomizationModeEnabledState.atom,
            ),
            objectPermissions: getObjectPermissionsForObject(
              objectPermissionsByObjectMetadataId,
              objectMetadataItem.id,
            ),
            objectMetadataItem,
          }),
        objectMetadataId: objectMetadataItem.id,
        fieldMetadataItem,
        objectPermissionsByObjectMetadataId,
      }),
    };
  };

  const closeOnDemandField = useCallback(() => {
    store.set(displayState, { loadStatus: 'closed' });
  }, [displayState, store]);

  return { loadStatus, openOnDemandField, closeOnDemandField };
};
