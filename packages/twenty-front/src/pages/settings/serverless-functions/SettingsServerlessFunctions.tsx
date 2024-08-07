import { IconPlus, IconSettings } from 'twenty-ui';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';

export const SettingsServerlessFunctions = () => {
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb links={[{ children: 'Functions' }]} />
          <UndecoratedLink
            to={getSettingsPagePath(SettingsPath.NewServerlessFunction)}
          >
            <Button
              Icon={IconPlus}
              title="New Function"
              accent="blue"
              size="small"
            />
          </UndecoratedLink>
        </SettingsHeaderContainer>
        <Section>
          <SettingsServerlessFunctionsTable />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
