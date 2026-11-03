import { SettingsApplicationHealthBanner } from '@/settings/applications/components/SettingsApplicationHealthBanner';
import { type ApplicationHealthCheckState } from '@/settings/applications/types/ApplicationHealthCheckState';
import { getApplicationHealthBanner } from '@/settings/applications/utils/getApplicationHealthBanner';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type SettingsApplicationHealthCheckBannerProps = {
  applicationId: string;
  healthCheckFamilyState: FamilyState<ApplicationHealthCheckState, string>;
  fallbackLocation?: string;
};

export const SettingsApplicationHealthCheckBanner = ({
  applicationId,
  healthCheckFamilyState,
  fallbackLocation,
}: SettingsApplicationHealthCheckBannerProps) => {
  const navigate = useNavigate();

  const { result } = useAtomFamilyStateValue(
    healthCheckFamilyState,
    applicationId,
  );

  const healthBanner = getApplicationHealthBanner({
    healthCheckResult: result,
    fallbackLocation,
  });

  if (!isDefined(healthBanner)) {
    return null;
  }

  const { action } = healthBanner;

  return (
    <SettingsApplicationHealthBanner
      healthStatus={healthBanner.status}
      title={healthBanner.title}
      description={healthBanner.description}
      action={
        isDefined(action)
          ? { label: action.label, onClick: () => navigate(action.to) }
          : undefined
      }
    />
  );
};
