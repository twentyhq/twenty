import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { useCreateViewFromCurrentState } from '@/views/view-picker/hooks/useCreateViewFromCurrentState';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { useGetAvailableDateFields } from '@/views/view-picker/hooks/useGetAvailableDateFields';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerStartFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerStartFieldMetadataIdComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerMainGroupByFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerMainGroupByFieldMetadataIdComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';

export const ViewPickerCreateButton = () => {
  const { t } = useLingui();
  const { availableFieldsForGrouping, navigateToSelectSettings } =
    useGetAvailableFieldsToGroupRecordsBy();
  const { availableDateFields, navigateToDateFieldSettings } =
    useGetAvailableDateFields();

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
  const viewPickerStartFieldMetadataId = useAtomComponentStateValue(
    viewPickerStartFieldMetadataIdComponentState,
  );

  const { createViewFromCurrentState } = useCreateViewFromCurrentState();
  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();

  const handleCreateButtonClick = () => {
    createViewFromCurrentState();
  };

  if (viewPickerMode === 'edit') {
    return (
      <Button
        onClick={destroyViewFromCurrentState}
        fullWidth
        size="sm"
        disabled={viewPickerIsPersisting}
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
    viewPickerType === ViewType.CALENDAR &&
    availableDateFields.length === 0
  ) {
    return (
      <Button
        onClick={navigateToDateFieldSettings}
        size="sm"
        fullWidth
        variant="solid"
        color="accent"
      >{t`Go to Settings`}</Button>
    );
  }

  if (
    viewPickerType !== ViewType.KANBAN ||
    viewPickerMainGroupByFieldMetadataId !== ''
  ) {
    return (
      <Button
        onClick={handleCreateButtonClick}
        aria-label={t`Create new view`}
        fullWidth
        size="sm"
        disabled={
          viewPickerIsPersisting ||
          (viewPickerType === ViewType.KANBAN &&
            viewPickerMainGroupByFieldMetadataId === '') ||
          (viewPickerType === ViewType.CALENDAR &&
            viewPickerStartFieldMetadataId === '')
        }
        variant="solid"
        color="accent"
      >{t`Create`}</Button>
    );
  }
};
