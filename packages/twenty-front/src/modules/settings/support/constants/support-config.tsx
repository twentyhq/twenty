export const TICKET_STATUSES = [
  { key: 'OPEN', label: 'Abierto', color: '#EF4444' },
  { key: 'IN_PROGRESS', label: 'En Progreso', color: '#F59E0B' },
  { key: 'PENDING', label: 'Pendiente', color: '#8B5CF6' },
  { key: 'RESOLVED', label: 'Resuelto', color: '#10B981' },
  { key: 'CLOSED', label: 'Cerrado', color: '#6B7280' },
];

export const TICKET_PRIORITIES = [
  { key: 'LOW', label: 'Baja', color: '#10B981', slaHours: 48 },
  { key: 'MEDIUM', label: 'Media', color: '#F59E0B', slaHours: 24 },
  { key: 'HIGH', label: 'Alta', color: '#F97316', slaHours: 8 },
  { key: 'URGENT', label: 'Urgente', color: '#EF4444', slaHours: 2 },
];

export const TICKET_CATEGORIES = [
  { key: 'TECHNICAL', label: 'Técnico' },
  { key: 'BILLING', label: 'Facturación' },
  { key: 'SALES', label: 'Ventas' },
  { key: 'GENERAL', label: 'General' },
  { key: 'FEATURE_REQUEST', label: 'Solicitud de Función' },
  { key: 'BUG', label: 'Reporte de Error' },
];

export const SLA_CONFIG = {
  firstResponse: {
    LOW: 48 * 60,
    MEDIUM: 24 * 60,
    HIGH: 8 * 60,
    URGENT: 2 * 60,
  },
  resolution: {
    LOW: 7 * 24 * 60,
    MEDIUM: 3 * 24 * 60,
    HIGH: 24 * 60,
    URGENT: 4 * 60,
  },
};

export const CSAT_CONFIG = {
  questions: [
    '¿Cómo evaluaría su experiencia general?',
    '¿El agente resolvió su problema?',
    '¿Recomendaría nuestro servicio?',
  ],
  scale: [1, 2, 3, 4, 5],
};

export const NPS_CONFIG = {
  question: '¿Qué tan probable es que recomiende nuestro producto a un colega?',
  promoters: 9,
  passives: 7,
  detractors: 6,
};
