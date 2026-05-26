import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsOptionCardContentButton } from '@/settings/components/SettingsOptions/SettingsOptionCardContentButton';
import { SettingsLayoutCoverImage } from '@/settings/layout/components/SettingsLayoutCoverImage';
import { SettingsLayoutItemsStats } from '@/settings/layout/components/SettingsLayoutItemsStats';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Link, useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconLayoutDashboard,
  IconPencil,
  IconSettings,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledStackedCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledNavigationLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

export const SettingsLayout = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  const startCustomizing = () => {
    enterLayoutCustomizationMode();
    navigate('/');
  };

  return (
    <SubMenuTopBarContainer
      title={t`Layout`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Layout</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Customize`}
            description={t`Customize your sidebar, commands and record pages`}
          />
          <Card rounded>
            <SettingsLayoutCoverImage />
            <SettingsOptionCardContentButton
              Icon={IconLayoutDashboard}
              title={t`Customize layout`}
              description={t`Customize how your workspace looks.`}
              Button={
                <Button
                  title={t`Customize`}
                  variant="primary"
                  accent="blue"
                  size="small"
                  Icon={IconPencil}
                  onClick={startCustomizing}
                />
              }
            />
          </Card>
        </Section>
        <Section>
          <H2Title
            title={t`Manage`}
            description={t`All the layout items declared on your workspace`}
          />
          <StyledStackedCards>
            <SettingsLayoutItemsStats />
            <StyledNavigationLink
              to={getSettingsPath(SettingsPath.LayoutManageItems)}
            >
              <SettingsCard
                title={t`Manage layout items`}
                Icon={<IconSettings />}
              />
            </StyledNavigationLink>
          </StyledStackedCards>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
