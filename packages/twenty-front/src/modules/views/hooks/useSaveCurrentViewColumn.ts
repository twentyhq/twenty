import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import {
  buildViewFieldScopeInput,
  type ColumnScope,
} from '@/object-record/record-column-scope/utils/buildViewFieldScopeInput';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFieldWithScopeApiUpsert } from '@/views/hooks/internal/usePerformViewFieldWithScopeApiUpsert';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { type ViewField } from '@/views/types/ViewField';
import { getViewFieldSettingsInput } from '@/views/utils/getViewFieldSettingsInput';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveCurrentViewColumn = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewFieldWithScopeApiUpsert } =
    usePerformViewFieldWithScopeApiUpsert();

  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const store = useStore();

  const saveCurrentViewColumn = useCallback(
    async ({
      viewField,
      columnScope,
    }: {
      viewField: Omit<ViewField, 'definition'>;
      columnScope?: ColumnScope;
    }) => {
      const currentViewId = store.get(currentViewIdCallbackState);

      if (!canPersistChanges || !isDefined(currentViewId)) {
        return false;
      }

      return performViewFieldWithScopeApiUpsert({
        id: viewField.id,
        viewId: currentViewId,
        fieldMetadataId: viewField.fieldMetadataId,
        isVisible: viewField.isVisible,
        isCanonical: viewField.isCanonical,
        position: viewField.position,
        size: viewField.size,
        aggregateOperation: viewField.aggregateOperation,
        relationTargetFieldMetadataId:
          viewField.relationTargetFieldMetadataId ?? null,
        settings: getViewFieldSettingsInput(viewField.settings),
        scope: isDefined(columnScope)
          ? buildViewFieldScopeInput(columnScope)
          : null,
      });
    },
    [
      canPersistChanges,
      currentViewIdCallbackState,
      performViewFieldWithScopeApiUpsert,
      store,
    ],
  );

  return { saveCurrentViewColumn };
};
