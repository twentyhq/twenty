import { useRecoilValue } from 'recoil';

import { isClientConfigLoadedState } from '@/client-config/states/isClientConfigLoadedState';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const isClientConfigLoaded = useRecoilValue(isClientConfigLoadedState);

  return isClientConfigLoaded ? <>{children}</> : <></>;
};
