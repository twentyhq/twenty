import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { H2Title, Section, IconButton } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconMail, IconBrandWhatsapp, IconMessage, IconPlus, IconChartBar } from '@tabler/icons-react';
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

const CampaignList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CampaignRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  border-left: 4px solid #3B82F6;
`;

const CampaignInfo = styled.div`
  flex: 1;
`;

const CampaignName = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
`;

const CampaignMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const CampaignStats = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const STATUS_COLORS: Record<string, string> = {
  active: '#10B981',
  paused: '#F59E0B',
  completed: '#3B82F6',
  draft: '#6B7280',
};

export const SettingsMarketing = () => {
  const { t } = useTranslation();

  const { records: campaigns, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Campaign,
    limit: 50,
  });

  const campaignTypes = [
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

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO');
  };

  return (
    <SubMenuTopBarContainer
      title={t('Marketing')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Marketing') },
      ]}
    >
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t('Campañas de Marketing')} />
          <IconButton Icon={IconPlus} variant="primary" size="small" onClick={() => {}} />
        </div>

        <Grid>
          {campaignTypes.map((type) => (
            <Card key={type.id} accentColor={type.color}>
              <CardIcon>
                <type.icon size={24} />
              </CardIcon>
              <CardTitle>{type.name}</CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </Card>
          ))}
        </Grid>

        <div style={{ marginTop: '24px' }}>
          <H2Title title={t('Campaigns Activas')} />
        </div>

        {loading ? (
          <EmptyState>{t('Cargando...')}</EmptyState>
        ) : campaigns.length === 0 ? (
          <EmptyState>
            <IconChartBar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div>{t('No hay campañas creadas')}</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              {t('Crea tu primera campaña para comenzar')}
            </div>
          </EmptyState>
        ) : (
          <CampaignList>
            {campaigns.map((campaign: any) => (
              <CampaignRow key={campaign.id}>
                <CampaignInfo>
                  <CampaignName>{campaign.name || 'Sin nombre'}</CampaignName>
                  <CampaignMeta>
                    {campaign.type || 'Email'} • {campaign.startDate ? formatDate(campaign.startDate) : 'Sin fecha'} - {campaign.endDate ? formatDate(campaign.endDate) : 'Sin fecha'}
                  </CampaignMeta>
                </CampaignInfo>
                <CampaignStats>
                  <StatItem>
                    <StatValue>{campaign.sentCount || 0}</StatValue>
                    <StatLabel>Enviados</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{campaign.openCount || 0}</StatValue>
                    <StatLabel>Abiertos</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{campaign.clickCount || 0}</StatValue>
                    <StatLabel>Clics</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue style={{ color: STATUS_COLORS[campaign.status] || '#6B7280' }}>
                      {campaign.status || 'draft'}
                    </StatValue>
                    <StatLabel>Estado</StatLabel>
                  </StatItem>
                </CampaignStats>
              </CampaignRow>
            ))}
          </CampaignList>
        )}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
