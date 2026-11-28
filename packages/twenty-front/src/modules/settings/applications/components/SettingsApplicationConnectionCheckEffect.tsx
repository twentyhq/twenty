import { useRunConnectionCheck } from '@/settings/applications/hooks/useRunConnectionCheck';
import { useEffect } from 'react';

type SettingsApplicationConnectionCheckEffectProps = {
  connectedAccountId: string;
};

export const SettingsApplicationConnectionCheckEffect = ({
  connectedAccountId,
}: SettingsApplicationConnectionCheckEffectProps) => {
  const { runConnectionCheck } = useRunConnectionCheck();

  useEffect(() => {
    runConnectionCheck(connectedAccountId);
  }, [connectedAccountId, runConnectionCheck]);

  return null;
};
