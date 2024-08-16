import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionsTable } from '@/settings/serverless-functions/components/SettingsServerlessFunctionsTable';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { IconFunction, IconPlus } from 'twenty-ui';

export const SettingsServerlessFunctions = () => {
  return (
    <SubMenuTopBarContainer
      Icon={IconFunction}
      title="Functions"
      actionButton={
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
      }
    >
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb links={[{ children: 'Functions' }]} />
        </SettingsHeaderContainer>
        <Section>
          <SettingsServerlessFunctionsTable />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
