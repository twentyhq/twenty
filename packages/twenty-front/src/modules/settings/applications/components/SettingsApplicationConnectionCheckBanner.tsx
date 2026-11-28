import { SettingsApplicationHealthBanner } from '@/settings/applications/components/SettingsApplicationHealthBanner';
import { useRunConnectionCheck } from '@/settings/applications/hooks/useRunConnectionCheck';
import { connectionCheckFamilyState } from '@/settings/applications/states/connectionCheckFamilyState';
import {
  type ConnectionCheckBannerAction,
  getConnectionCheckBanner,
} from '@/settings/applications/utils/getConnectionCheckBanner';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type SettingsApplicationConnectionCheckBannerProps = {
  connectedAccountId: string;
};

export const SettingsApplicationConnectionCheckBanner = ({
  connectedAccountId,
}: SettingsApplicationConnectionCheckBannerProps) => {
  const navigate = useNavigate();
  const { runConnectionCheck } = useRunConnectionCheck();
  const { result } = useAtomFamilyStateValue(
    connectionCheckFamilyState,
    connectedAccountId,
  );

  const connectionCheckBanner = getConnectionCheckBanner(result);

  if (!isDefined(connectionCheckBanner)) {
    return null;
  }

  const handleActionClick = (action: ConnectionCheckBannerAction) => {
    if (action.kind === 'internal') {
      navigate(action.to);

      return;
    }

    // The fix happens at the provider, so check again when the user comes back.
    window.addEventListener(
      'focus',
      () => runConnectionCheck(connectedAccountId),
      { once: true },
    );
    window.open(action.url, '_blank', 'noopener,noreferrer');
  };

  const { action } = connectionCheckBanner;

  return (
    <SettingsApplicationHealthBanner
      healthStatus={connectionCheckBanner.status}
      title={connectionCheckBanner.title}
      description={connectionCheckBanner.description}
      action={
        isDefined(action)
          ? { label: action.label, onClick: () => handleActionClick(action) }
          : undefined
      }
    />
  );
};
