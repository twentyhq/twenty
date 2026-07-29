import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewOpenRecordIn } from '~/generated-metadata/graphql';
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

  const setAndPersistOpenRecordIn = useCallback(
    (openRecordIn: ViewOpenRecordIn, view: GraphQLView | undefined) => {
      if (!view) return;
      updateCurrentView({
        openRecordIn,
      });
    },
    [updateCurrentView],
  );

  const setAndPersistViewName = useCallback(
    (viewName: string, view: GraphQLView | undefined) => {
      if (!view) return;
      setViewPickerInputName(viewName);
      updateCurrentView({
        name: viewName,
      });
    },
    [setViewPickerInputName, updateCurrentView],
  );

  const setAndPersistViewIcon = useCallback(
    (viewIcon: string, view: GraphQLView | undefined) => {
      if (!view) return;
      setViewPickerSelectedIcon(viewIcon);
      updateCurrentView({
        icon: viewIcon,
      });
    },
    [setViewPickerSelectedIcon, updateCurrentView],
  );

  return {
    setAndPersistOpenRecordIn,
    setAndPersistViewName,
    setAndPersistViewIcon,
  };
};
