import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { useCreateViewFromCurrentState } from '@/views/view-picker/hooks/useCreateViewFromCurrentState';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerMainGroupByFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerMainGroupByFieldMetadataIdComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { t } from '@lingui/core/macro';
import { Button } from 'twenty-ui/input';

export const ViewPickerEditButton = () => {
  const { availableFieldsForGrouping, navigateToSelectSettings } =
    useGetAvailableFieldsToGroupRecordsBy();

  const { viewPickerMode } = useViewPickerMode();
  const viewPickerType = useRecoilComponentValueV2(
    viewPickerTypeComponentState,
  );
  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingComponentState,
  );
  const viewPickerMainGroupByFieldMetadataId = useRecoilComponentValueV2(
    viewPickerMainGroupByFieldMetadataIdComponentState,
  );

  const { createViewFromCurrentState } = useCreateViewFromCurrentState();
  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();

  if (viewPickerMode === 'edit') {
    return (
      <Button
        title={t`Delete`}
        onClick={destroyViewFromCurrentState}
        accent="danger"
        fullWidth
        size="small"
        justify="center"
        focus={false}
        variant="secondary"
        disabled={viewPickerIsPersisting}
      />
    );
  }

  if (
    viewPickerType === ViewType.Kanban &&
    availableFieldsForGrouping.length === 0
  ) {
    return (
      <Button
        title={t`Go to Settings`}
        onClick={navigateToSelectSettings}
        size="small"
        accent="blue"
        fullWidth
        justify="center"
      />
    );
  }

  if (
    viewPickerType === ViewType.Table ||
    viewPickerMainGroupByFieldMetadataId !== ''
  ) {
    return (
      <Button
        title={t`Create`}
        onClick={createViewFromCurrentState}
        accent="blue"
        fullWidth
        size="small"
        justify="center"
        disabled={
          viewPickerIsPersisting ||
          (viewPickerType === ViewType.Kanban &&
            viewPickerMainGroupByFieldMetadataId === '')
        }
      />
    );
  }
};
