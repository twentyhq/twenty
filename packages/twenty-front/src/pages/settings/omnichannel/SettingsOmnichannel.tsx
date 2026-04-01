import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconBrandWhatsapp, IconBrandTelegram, IconMail, IconMessage } from '@tabler/icons-react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

export const SettingsOmnichannel = () => {
  const { t } = useTranslation();

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp', description: 'Conecta WhatsApp Business', icon: IconBrandWhatsapp, color: '#25D366' },
    { id: 'telegram', name: 'Telegram', description: 'Bot de Telegram', icon: IconBrandTelegram, color: '#0088CC' },
    { id: 'email', name: 'Email', description: 'Email support', icon: IconMail, color: '#EA4335' },
    { id: 'chat', name: 'Live Chat', description: 'Chat en vivo', icon: IconMessage, color: '#3B82F6' },
  ];

  return (
    <SubMenuTopBarContainer
      title={t('Omnichannel')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Omnichannel') },
      ]}
    >
      <StyledContainer>
        <H2Title title={t('Canales de Comunicación')} />
        <Grid>
          {channels.map((channel) => (
            <Card key={channel.id} accentColor={channel.color}>
              <CardTitle>
                <channel.icon size={20} style={{ marginRight: 8 }} />
                {channel.name}
              </CardTitle>
              <CardDescription>{channel.description}</CardDescription>
            </Card>
          ))}
        </Grid>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
