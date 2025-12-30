import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { t } from '@lingui/core/macro';
import { SettingsAIMCP } from './components/SettingsAIMCP';
import { SettingsAIRouterSettings } from './components/SettingsAIRouterSettings';
import { SettingsSkillsTable } from './components/SettingsSkillsTable';

export const SettingsAI = () => {
  return (
    <SubMenuTopBarContainer
      title={t`AI`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAIRouterSettings />
        <SettingsSkillsTable />
        <SettingsAIMCP />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
