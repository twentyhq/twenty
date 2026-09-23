import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { useCreateViewFromCurrentState } from '@/views/view-picker/hooks/useCreateViewFromCurrentState';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerCalendarFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerCalendarFieldMetadataIdComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerMainGroupByFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerMainGroupByFieldMetadataIdComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';

export const ViewPickerCreateButton = () => {
  const { t } = useLingui();
  const { availableFieldsForGrouping, navigateToSelectSettings } =
    useGetAvailableFieldsToGroupRecordsBy();
  const { availableFieldsForCalendar, navigateToDateFieldSettings } =
    useGetAvailableFieldsForCalendar();

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
  const viewPickerCalendarFieldMetadataId = useAtomComponentStateValue(
    viewPickerCalendarFieldMetadataIdComponentState,
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
    availableFieldsForCalendar.length === 0
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
            viewPickerCalendarFieldMetadataId === '')
        }
        variant="solid"
        color="accent"
      >{t`Create`}</Button>
    );
  }
};
