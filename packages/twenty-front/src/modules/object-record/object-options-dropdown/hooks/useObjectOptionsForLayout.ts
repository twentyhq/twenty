import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useCallback } from 'react';

export const useObjectOptionsForLayout = () => {
  const { updateCurrentView } = useUpdateCurrentView();

  const setAndPersistViewType = useCallback(
    (viewType: ViewType) => {
      // setViewType(view);
      updateCurrentView({
        type: viewType,
      });
    },
    [updateCurrentView],
  );

  return {
    setAndPersistViewType,
  };
};
