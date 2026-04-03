import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconKey } from 'twenty-ui/display';

const COMPONENT_INSTANCE_ID = 'information-banner-legacy-enterprise-key';

export const InformationBannerLegacyEnterpriseKey = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const setInformationBannerIsOpen = useSetAtomComponentState(
    informationBannerIsOpenComponentState,
    COMPONENT_INSTANCE_ID,
  );

  const hasLegacyKey =
    currentWorkspace?.hasValidEnterpriseKey === true &&
    currentWorkspace?.hasValidSignedEnterpriseKey !== true;

  if (!hasLegacyKey) {
    return null;
  }

  return (
    <InformationBanner
      componentInstanceId={COMPONENT_INSTANCE_ID}
      variant="secondary"
      message={t`Your enterprise key format is deprecated. Please activate a new key to keep enterprise features.`}
      buttonTitle={t`Activate`}
      buttonIcon={IconKey}
      buttonOnClick={() =>
        navigate(getSettingsPath(SettingsPath.AdminPanelEnterprise))
      }
      onClose={() => setInformationBannerIsOpen(false)}
    />
  );
};
