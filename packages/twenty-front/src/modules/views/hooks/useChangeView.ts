import { useResetUnsavedViewStates } from '@/views/hooks/useResetUnsavedViewStates';
import { useSetViewInUrl } from '@/views/hooks/useSetViewInUrl';

export const useChangeView = (viewBarComponentId?: string) => {
  const { resetUnsavedViewStates } =
    useResetUnsavedViewStates(viewBarComponentId);

  const { setViewInUrl } = useSetViewInUrl();

  const changeView = async (viewId: string) => {
    setViewInUrl(viewId);
    resetUnsavedViewStates(viewId);
  };

  return { changeView };
};
