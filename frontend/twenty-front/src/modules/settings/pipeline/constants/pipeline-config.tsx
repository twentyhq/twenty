export const PIPELINE_STAGES = [
  { key: 'NEW', label: 'Nuevo', probability: 10, color: '#10B981' },
  { key: 'SCREENING', label: 'Evaluación', probability: 20, color: '#F59E0B' },
  { key: 'MEETING', label: 'Reunión', probability: 40, color: '#F97316' },
  { key: 'PROPOSAL', label: 'Propuesta', probability: 60, color: '#8B5CF6' },
  { key: 'CUSTOMER', label: 'Cliente', probability: 80, color: '#3B82F6' },
  { key: 'WON', label: 'Ganado', probability: 100, color: '#22C55E' },
  { key: 'LOST', label: 'Perdido', probability: 0, color: '#EF4444' },
];

export const PIPELINE_TYPES = [
  { key: 'NEW_BUSINESS', label: 'Nuevos Negocios', icon: 'IconPlus' },
  { key: 'RENEWALS', label: 'Renovaciones', icon: 'IconRefresh' },
  { key: 'UPSELL', label: 'Venta Adicional', icon: 'IconTrendingUp' },
  { key: 'PARTNER', label: 'Socios', icon: 'IconUsers' },
];

export const LEAD_SOURCES = [
  { key: 'WEBSITE', label: 'Sitio Web', icon: 'IconWorld' },
  { key: 'REFERRAL', label: 'Referido', icon: 'IconUserPlus' },
  { key: 'COLD_OUTBOUND', label: 'Frío Saliente', icon: 'IconPhone' },
  { key: 'WARM_OUTBOUND', label: 'Cálido Saliente', icon: 'IconMail' },
  { key: 'SOCIAL_MEDIA', label: 'Redes Sociales', icon: 'IconBrandFacebook' },
  { key: 'EVENT', label: 'Evento', icon: 'IconCalendar' },
  { key: 'PARTNER', label: 'Socio', icon: 'IconHandshake' },
  { key: 'ADVERTISING', label: 'Publicidad', icon: 'IconMegaphone' },
  { key: 'OTHER', label: 'Otro', icon: 'IconDots' },
];

export const LOST_REASONS = [
  { key: 'NO_BUDGET', label: 'Sin Presupuesto' },
  { key: 'NO_NEED', label: 'Sin Necesidad' },
  { key: 'COMPETITOR', label: 'Competidor' },
  { key: 'PRICING', label: 'Precio' },
  { key: 'TIMING', label: 'Timing' },
  { key: 'LOST_CONTACT', label: 'Perdimos Contacto' },
  { key: 'TECHNICAL_ISSUES', label: 'Problemas Técnicos' },
  { key: 'LEGAL_ISSUES', label: 'Problemas Legales' },
  { key: 'OTHER', label: 'Otro' },
];

export const PIPELINE_CONFIG = {
  defaultStages: PIPELINE_STAGES,
  probabilityEnabled: true,
  weightedValueEnabled: true,
  forecastEnabled: true,
  automationEnabled: true,
  analyticsEnabled: true,
};

export const getProbabilityForStage = (stage: string): number => {
  const stageConfig = PIPELINE_STAGES.find((s) => s.key === stage);
  return stageConfig?.probability ?? 10;
};

export const calculateWeightedAmount = (
  amount: number | null,
  stage: string,
): number => {
  if (!amount) return 0;
  const probability = getProbabilityForStage(stage) / 100;
  return Math.round(amount * probability);
};

export const getStageColor = (stage: string): string => {
  const stageConfig = PIPELINE_STAGES.find((s) => s.key === stage);
  return stageConfig?.color ?? '#6B7280';
};
