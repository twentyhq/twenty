import styled from '@emotion/styled';
import {
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconPlus,
  Section
} from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { ShowMemberTabs } from '@/workspace-member/ShowMemberTabs';

import { useTranslation } from 'react-i18next';

const StyledAddNewMemberButtonContainer = styled.div`
  display: flex;
  align-items: 'center';
  justify-content: space-between;
`;

export const SettingsWorkspaceMembers = () => {

  const { t } = useTranslation();
  
  return (
    <SubMenuTopBarContainer
      title=""
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Members' },
      ]}
    >
      <SettingsPageContainer>
        <StyledAddNewMemberButtonContainer>
          <H1Title title="Members" fontColor={H1TitleFontColor.Primary} />
          <UndecoratedLink to={getSettingsPagePath(SettingsPath.NewMember)}>
              <Button
                Icon={IconPlus}
                title={t('addMembers')}
                accent="blue"
                size="small"
              />
          </UndecoratedLink>  
        </StyledAddNewMemberButtonContainer>
        <Section>
          <H2Title
            title={t('manageMembers')}
            description={t('membersDescription')}
          />
          <ShowMemberTabs />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
