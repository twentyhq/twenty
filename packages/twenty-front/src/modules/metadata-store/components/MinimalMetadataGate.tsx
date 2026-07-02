import { Outlet } from 'react-router-dom';

import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const MinimalMetadataGate = () => {
  const isMinimalMetadataReady = useAtomStateValue(isMinimalMetadataReadyState);

  if (!isMinimalMetadataReady) {
    return <UserOrMetadataLoader />;
  }

  return <Outlet />;
};
