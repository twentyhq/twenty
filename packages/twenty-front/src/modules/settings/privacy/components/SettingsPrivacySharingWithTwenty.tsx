import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconChartLine } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useIsTwentyCloud } from '@/settings/privacy/hooks/useIsTwentyCloud';
import { useUpdateWorkspacePrivacySettings } from '@/settings/privacy/hooks/useUpdateWorkspacePrivacySettings';
import { ImpersonationSwitch } from '@/settings/workspace/components/ImpersonationSwitch';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsPrivacySharingWithTwenty = () => {
  const { t } = useLingui();
  const isTwentyCloud = useIsTwentyCloud();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { updateWorkspacePrivacySettings } =
    useUpdateWorkspacePrivacySettings();

  return (
    <Section.Root>
      <Section.Header
        title={t`Sharing with Twenty`}
        description={t`Choose what Twenty can access to support you and improve the product.`}
      />
      <Card.Root>
        <ImpersonationSwitch divider={isTwentyCloud} />
        {isTwentyCloud && (
          <SettingsOptionCardContentSwitch
            Icon={IconChartLine}
            title={t`Help improve Twenty`}
            description={t`Share session replays and AI conversations to help us improve Twenty`}
            checked={
              currentWorkspace?.isProductImprovementDataSharingEnabled ?? true
            }
            onChange={(checked) =>
              updateWorkspacePrivacySettings({
                isProductImprovementDataSharingEnabled: checked,
              })
            }
          />
        )}
      </Card.Root>
    </Section.Root>
  );
};
