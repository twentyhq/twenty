import { FieldMetadataType } from 'twenty-shared/types';

export const STAGE_PROBABILITIES: Record<string, number> = {
  NEW: 10,
  SCREENING: 20,
  MEETING: 40,
  PROPOSAL: 60,
  CUSTOMER: 80,
  WON: 100,
  LOST: 0,
};

export const DEFAULT_STAGES = [
  { key: 'NEW', label: 'Nuevo', probability: 10 },
  { key: 'SCREENING', label: 'Evaluación', probability: 20 },
  { key: 'MEETING', label: 'Reunión', probability: 40 },
  { key: 'PROPOSAL', label: 'Propuesta', probability: 60 },
  { key: 'CUSTOMER', label: 'Cliente', probability: 80 },
  { key: 'WON', label: 'Ganado', probability: 100 },
  { key: 'LOST', label: 'Perdido', probability: 0 },
];

export const PIPELINE_TYPES = [
  { key: 'NEW_BUSINESS', label: 'Nuevos Negocios' },
  { key: 'RENEWALS', label: 'Renovaciones' },
  { key: 'UPSELL', label: 'Venta Adicional' },
  { key: 'PARTNER', label: 'Socios' },
];

export const LEAD_SOURCES = [
  { key: 'WEBSITE', label: 'Sitio Web' },
  { key: 'REFERRAL', label: 'Referido' },
  { key: 'COLD_OUTBOUND', label: 'Frío Saliente' },
  { key: 'WARM_OUTBOUND', label: 'Cálido Saliente' },
  { key: 'SOCIAL_MEDIA', label: 'Redes Sociales' },
  { key: 'EVENT', label: 'Evento' },
  { key: 'PARTNER', label: 'Socio' },
  { key: 'ADVERTISING', label: 'Publicidad' },
  { key: 'OTHER', label: 'Otro' },
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
