import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconCheckbox, IconUsers } from '@tabler/icons-react';

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
  padding: 20px;
  border-top: 3px solid #3B82F6;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
`;

const CardDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 13px;
`;

export const SettingsProjects = () => {
  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={t('Proyectos')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Proyectos') },
      ]}
    >
      <StyledContainer>
        <H2Title title={t('Gestión de Proyectos')} />
        <Card>
          <CardTitle>
            <IconCheckbox size={20} style={{ marginRight: 8 }} />
            {t('Proyectos')}
          </CardTitle>
          <CardDescription>
            {t('Gestiona tus proyectos y tareas')}
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>
            <IconUsers size={20} style={{ marginRight: 8 }} />
            {t('Equipo')}
          </CardTitle>
          <CardDescription>
            {t('Asigna tareas a tu equipo')}
          </CardDescription>
        </Card>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
