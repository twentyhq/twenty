import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui/display';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['8']};
  padding: ${themeCssVariables.spacing['8']};
  width: 100%;
`;

const Card = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-radius: 8px;
  padding: 16px;
`;

export const SettingsPipelineDeal = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Detalle del Deal`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
        { children: t`Pipeline`, href: getSettingsPath(SettingsPath.Pipeline) },
        { children: t`Detalle` },
      ]}
    >
      <StyledContainer>
        <Card>
          <H2Title title="Deal Details" />
          <p>Deal detail view - connect to GraphQL API</p>
        </Card>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
