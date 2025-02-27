import { MultipleObjectsPickerComponentInstanceContext } from '@/object-record/multiple-objects/multiple-objects-picker/states/contexts/MultipleObjectsPickerComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useMultipleObjectsPickerToggle = (
  componentInstanceIdFromProps: string,
) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleObjectsPickerComponentInstanceContext,
    componentInstanceIdFromProps,
  );

  const openMultipleObjectsPicker = () => {
    console.log('openMultipleObjectsPicker', componentInstanceId);
  };

  const closeMultipleObjectsPicker = () => {
    console.log('closeMultipleObjectsPicker', componentInstanceId);
  };

  return {
    openMultipleObjectsPicker,
    closeMultipleObjectsPicker,
  };
};
