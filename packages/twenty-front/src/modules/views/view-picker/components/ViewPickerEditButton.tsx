import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { ViewType } from '@/views/types/ViewType';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { computeViewPickerVisibleViews } from '@/views/view-picker/utils/computeViewPickerVisibleViews';
import { useCreateViewFromCurrentState } from '@/views/view-picker/hooks/useCreateViewFromCurrentState';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerMainGroupByFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerMainGroupByFieldMetadataIdComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { Button } from 'twenty-ui/primitives/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const ViewPickerEditButton = () => {
  const { availableFieldsForGrouping, navigateToSelectSettings } =
    useGetAvailableFieldsToGroupRecordsBy();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const viewsOnCurrentObject = useAtomFamilySelectorValue(
    viewsFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const { currentView } = useGetCurrentViewOnly();

  const isInitialObjectViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED,
  );

  const visibleViews = computeViewPickerVisibleViews({
    views: viewsOnCurrentObject,
    currentViewId: currentView?.id,
    isInitialObjectViewEnabled,
  });

  const isLastView = visibleViews.length <= 1;

  const { viewPickerMode } = useViewPickerMode();
  const viewPickerType = useAtomComponentStateValue(
    viewPickerTypeComponentState,
  );
  const viewPickerIsPersisting = useAtomComponentStateValue(
    viewPickerIsPersistingComponentState,
  );
  const viewPickerMainGroupByFieldMetadataId = useAtomComponentStateValue(
    viewPickerMainGroupByFieldMetadataIdComponentState,
  );

  const { createViewFromCurrentState } = useCreateViewFromCurrentState();
  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();

  if (viewPickerMode === 'edit') {
    return (
      <Button
        onClick={destroyViewFromCurrentState}
        fullWidth
        size="sm"
        disabled={viewPickerIsPersisting || isLastView}
        variant="outline"
        color="danger"
      >{t`Delete`}</Button>
    );
  }

  if (
    viewPickerType === ViewType.KANBAN &&
    availableFieldsForGrouping.length === 0
  ) {
    return (
      <Button
        onClick={navigateToSelectSettings}
        size="sm"
        fullWidth
        variant="solid"
        color="accent"
      >{t`Go to Settings`}</Button>
    );
  }

  if (
    viewPickerType === ViewType.TABLE ||
    viewPickerMainGroupByFieldMetadataId !== ''
  ) {
    return (
      <Button
        onClick={createViewFromCurrentState}
        fullWidth
        size="sm"
        disabled={
          viewPickerIsPersisting ||
          (viewPickerType === ViewType.KANBAN &&
            viewPickerMainGroupByFieldMetadataId === '')
        }
        variant="solid"
        color="accent"
      >{t`Create`}</Button>
    );
  }
};
