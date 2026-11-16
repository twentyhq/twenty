import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconChartLine } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useIsTwentyCloud } from '@/settings/privacy/hooks/useIsTwentyCloud';
import { useUpdateWorkspaceAiDataPolicyField } from '@/settings/privacy/hooks/useUpdateWorkspaceAiDataPolicyField';
import { ImpersonationSwitch } from '@/settings/workspace/components/ImpersonationSwitch';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsPrivacySharingWithTwenty = () => {
  const { t } = useLingui();
  const isTwentyCloud = useIsTwentyCloud();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { updateWorkspaceAiDataPolicyField } =
    useUpdateWorkspaceAiDataPolicyField();

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
              getWorkspaceAiDataPolicy(currentWorkspace)
                .isProductImprovementDataSharingEnabled
            }
            onChange={(checked) =>
              updateWorkspaceAiDataPolicyField({
                field: 'isProductImprovementDataSharingEnabled',
                value: checked,
              })
            }
          />
        )}
      </Card.Root>
    </Section.Root>
  );
};
