import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, Section } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconMail, IconBrandWhatsapp, IconMessage } from '@tabler/icons-react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const Card = styled.div<{ accentColor?: string }>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  padding: 20px;
  border-top: 3px solid ${({ accentColor }) => accentColor ?? '#3B82F6'};
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

const CardIcon = styled.div`
  margin-bottom: 12px;
  color: ${({ theme }) => theme.font.color.primary};
`;

export const SettingsMarketing = () => {
  const { t } = useTranslation();

  const campaigns = [
    {
      id: 'email',
      name: 'Email Marketing',
      description: 'Crea y gestiona campañas de email',
      icon: IconMail,
      color: '#3B82F6',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Envía mensajes masivos por WhatsApp',
      icon: IconBrandWhatsapp,
      color: '#25D366',
    },
    {
      id: 'sms',
      name: 'SMS Marketing',
      description: 'Campañas de SMS marketing',
      icon: IconMessage,
      color: '#8B5CF6',
    },
  ];

  return (
    <SubMenuTopBarContainer
      title={t('Marketing')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Marketing') },
      ]}
    >
      <StyledContainer>
        <H2Title title={t('Campañas de Marketing')} />
        <Grid>
          {campaigns.map((campaign) => (
            <Card key={campaign.id} accentColor={campaign.color}>
              <CardIcon>
                <campaign.icon size={24} />
              </CardIcon>
              <CardTitle>{campaign.name}</CardTitle>
              <CardDescription>{campaign.description}</CardDescription>
            </Card>
          ))}
        </Grid>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
