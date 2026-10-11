import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { useCallback } from 'react';

export const useUpdateObjectViewOptions = () => {
  const setViewPickerInputName = useSetAtomComponentState(
    viewPickerInputNameComponentState,
  );

  const setViewPickerSelectedIcon = useSetAtomComponentState(
    viewPickerSelectedIconComponentState,
  );

  const { updateCurrentView } = useUpdateCurrentView();

  const setAndPersistViewName = useCallback(
    (viewName: string) => {
      setViewPickerInputName(viewName);
      updateCurrentView({
        name: viewName,
      });
    },
    [setViewPickerInputName, updateCurrentView],
  );

  const setAndPersistViewIcon = useCallback(
    (viewIcon: string) => {
      setViewPickerSelectedIcon(viewIcon);
      updateCurrentView({
        icon: viewIcon,
      });
    },
    [setViewPickerSelectedIcon, updateCurrentView],
  );

  return {
    setAndPersistViewName,
    setAndPersistViewIcon,
  };
};
