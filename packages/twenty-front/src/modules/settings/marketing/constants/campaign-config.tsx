export const CAMPAIGN_STATUSES = [
  { key: 'DRAFT', label: 'Borrador', color: '#6B7280' },
  { key: 'SCHEDULED', label: 'Programado', color: '#8B5CF6' },
  { key: 'ACTIVE', label: 'Activo', color: '#10B981' },
  { key: 'PAUSED', label: 'Pausado', color: '#F59E0B' },
  { key: 'COMPLETED', label: 'Completado', color: '#3B82F6' },
  { key: 'CANCELLED', label: 'Cancelado', color: '#EF4444' },
];

export const CAMPAIGN_TYPES = [
  { key: 'EMAIL', label: 'Email Marketing', icon: 'IconMail' },
  { key: 'SMS', label: 'SMS', icon: 'IconMessage' },
  { key: 'SOCIAL', label: 'Redes Sociales', icon: 'IconBrandFacebook' },
  { key: 'AD', label: 'Publicidad', icon: 'IconMegaphone' },
  { key: 'EVENT', label: 'Evento', icon: 'IconCalendar' },
];

export const EMAIL_TEMPLATE_CATEGORIES = [
  { key: 'WELCOME', label: 'Bienvenida' },
  { key: 'NURTURING', label: 'Nurturing' },
  { key: 'PROMOTIONAL', label: 'Promocional' },
  { key: 'NEWSLETTER', label: 'Newsletter' },
  { key: 'ANNOUNCEMENT', label: 'Anuncio' },
  { key: 'TRANSACTIONAL', label: 'Transaccional' },
];

export const SEQUENCE_STATUSES = [
  { key: 'DRAFT', label: 'Borrador', color: '#6B7280' },
  { key: 'ACTIVE', label: 'Activo', color: '#10B981' },
  { key: 'PAUSED', label: 'Pausado', color: '#F59E0B' },
  { key: 'COMPLETED', label: 'Completado', color: '#3B82F6' },
];

export const calculateCampaignMetrics = (campaign: {
  totalRecipients?: number;
  sentCount?: number;
  openCount?: number;
  clickCount?: number;
}) => {
  const openRate = campaign.totalRecipients 
    ? ((campaign.openCount || 0) / campaign.totalRecipients * 100).toFixed(1) 
    : '0';
  const clickRate = campaign.openCount 
    ? ((campaign.clickCount || 0) / campaign.openCount * 100).toFixed(1) 
    : '0';
  return { openRate, clickRate };
};
