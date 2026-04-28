import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const InformationBannerNoMoreCredits = () => {
  const { t } = useLingui();

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToUpdateCreditPlan } =
    usePermissionFlagMap();

  const navigateSettings = useNavigateSettings();

  return (
    <InformationBanner
      componentInstanceId="information-banner-no-more-credits"
      color="danger"
      variant="secondary"
      message={
        hasPermissionToUpdateCreditPlan
          ? t`Credits limit reached. Update your credit plan to keep Workflows and AI running.`
          : t`Credits limit reached. Contact your admin to resume Workflows and AI.`
      }
      buttonTitle={hasPermissionToUpdateCreditPlan ? t`Update plan` : undefined}
      buttonOnClick={async () => navigateSettings(SettingsPath.Billing)}
    />
  );
};
