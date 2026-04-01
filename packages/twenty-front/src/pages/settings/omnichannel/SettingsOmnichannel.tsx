import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { H2Title, IconButton, Badge } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconBrandWhatsapp, IconBrandTelegram, IconMail, IconMessage, IconPlus, IconSend } from '@tabler/icons-react';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 13px;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MessageItem = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 6px;
  padding: 12px;
  border-left: 3px solid #3B82F6;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MessageSender = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

const MessageContent = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const MessageMeta = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-top: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const CHANNEL_CONFIG: Record<string, { color: string; label: string }> = {
  whatsapp: { color: '#25D366', label: 'WhatsApp' },
  telegram: { color: '#0088CC', label: 'Telegram' },
  email: { color: '#EA4335', label: 'Email' },
  chat: { color: '#3B82F6', label: 'Live Chat' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  sent: { color: '#3B82F6', label: 'Enviado' },
  delivered: { color: '#10B981', label: 'Entregado' },
  read: { color: '#8B5CF6', label: 'Leido' },
  failed: { color: '#EF4444', label: 'Fallido' },
};

export const SettingsOmnichannel = () => {
  const { t } = useTranslation();

  const { records: messages, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.OmnichannelMessage,
    limit: 20,
    orderBy: [{ receivedAt: 'DESC' }],
  });

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp', description: 'Conecta WhatsApp Business', icon: IconBrandWhatsapp, color: '#25D366' },
    { id: 'telegram', name: 'Telegram', description: 'Bot de Telegram', icon: IconBrandTelegram, color: '#0088CC' },
    { id: 'email', name: 'Email', description: 'Email support', icon: IconMail, color: '#EA4335' },
    { id: 'chat', name: 'Live Chat', description: 'Chat en vivo', icon: IconMessage, color: '#3B82F6' },
  ];

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-CO');
  };

  return (
    <SubMenuTopBarContainer
      title={t('Omnichannel')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Omnichannel') },
      ]}
    >
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t('Canales de Comunicacion')} />
          <IconButton Icon={IconPlus} variant="primary" size="small" onClick={() => {}} />
        </div>

        <Grid>
          {channels.map((channel) => (
            <Card key={channel.id} accentColor={channel.color}>
              <CardTitle>
                <channel.icon size={20} />
                {channel.name}
              </CardTitle>
              <CardDescription>{channel.description}</CardDescription>
            </Card>
          ))}
        </Grid>

        <H2Title title={t('Mensajes Recientes')} />
        
        {loading ? (
          <EmptyState>{t('Cargando...')}</EmptyState>
        ) : messages.length === 0 ? (
          <EmptyState>
            <IconSend size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div>{t('No hay mensajes')}</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              {t('Conecta un canal para comenzar')}
            </div>
          </EmptyState>
        ) : (
          <MessageList>
            {messages.map((message: any) => {
              const channel = CHANNEL_CONFIG[message.channel] || CHANNEL_CONFIG.chat;
              const status = STATUS_CONFIG[message.status] || STATUS_CONFIG.sent;
              
              return (
                <MessageItem key={message.id}>
                  <MessageHeader>
                    <MessageSender>
                      {message.senderName || message.senderPhone || message.senderEmail || 'Desconocido'}
                    </MessageSender>
                    <Badge variant="info">{channel.label}</Badge>
                  </MessageHeader>
                  <MessageContent>
                    {message.content?.substring(0, 100)}
                    {message.content?.length > 100 ? '...' : ''}
                  </MessageContent>
                  <MessageMeta>{`${formatDate(message.receivedAt)} - ${status.label}`}</MessageMeta>
                </MessageItem>
              );
            })}
          </MessageList>
        )}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};

