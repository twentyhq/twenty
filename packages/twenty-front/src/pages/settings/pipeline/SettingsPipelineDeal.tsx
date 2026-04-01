import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, Section } from 'twenty-ui';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  padding: 16px;
`;

export const SettingsPipelineDeal = () => {
  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={t('Detalle del Deal')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Pipeline'), href: getSettingsPath(SettingsPath.Pipeline) },
        { children: t('Detalle') },
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
