import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { useSearchParams } from 'react-router-dom';

export const useChangeView = (viewBarComponentId?: string) => {
  const { resetUnsavedViewStates } =
    useResetUnsavedViewStates(viewBarComponentId);

  const [, setSearchParams] = useSearchParams();

  const setViewInUrl = (viewId: string) => {
    setSearchParams(() => {
      const searchParams = new URLSearchParams();
      searchParams.set('view', viewId);
      return searchParams;
    });
  };

  const changeView = async (viewId: string) => {
    setViewInUrl(viewId);
    resetUnsavedViewStates(viewId);
  };

  return { changeView };
};
