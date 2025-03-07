import { useSetViewInUrl } from '@/views/hooks/useSetViewInUrl';

export const useChangeView = () => {
  const { setViewInUrl } = useSetViewInUrl();

  const changeView = (viewId: string) => {
    setViewInUrl(viewId);
  };

  return { changeView };
};
