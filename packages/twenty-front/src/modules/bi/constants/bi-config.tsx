export const BI_WIDGET_TYPES = {
  METRIC: 'metric',
  LINE_CHART: 'line_chart',
  BAR_CHART: 'bar_chart',
  PIE_CHART: 'pie_chart',
  FUNNEL: 'funnel',
  TABLE: 'table',
  GAUGE: 'gauge',
  HEATMAP: 'heatmap',
  SCOUTER: 'scouter',
} as const;

export const BI_METRICS = {
  REVENUE: 'revenue',
  DEALS: 'deals',
  WIN_RATE: 'winRate',
  AVG_DEAL_SIZE: 'avgDealSize',
  PIPELINE_VALUE: 'pipelineValue',
  CONVERSION_RATE: 'conversionRate',
  SALES_CYCLE: 'salesCycle',
  CALLS: 'calls',
  EMAILS_SENT: 'emailsSent',
  MEETINGS: 'meetings',
  TICKETS_RESOLVED: 'ticketsResolved',
  CUSTOMERS: 'customers',
  NPS: 'nps',
} as const;

export const BI_PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'yesterday', label: 'Ayer' },
  { key: 'this_week', label: 'Esta Semana' },
  { key: 'last_week', label: 'Semana Pasada' },
  { key: 'this_month', label: 'Este Mes' },
  { key: 'last_month', label: 'Mes Pasado' },
  { key: 'this_quarter', label: 'Este Trimestre' },
  { key: 'last_quarter', label: 'Trimestre Pasado' },
  { key: 'this_year', label: 'Este Año' },
  { key: 'last_year', label: 'Año Pasado' },
  { key: 'custom', label: 'Personalizado' },
];

export const BI_CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const DEFAULT_DASHBOARD_LAYOUT = [
  {
    id: 'revenue',
    type: BI_WIDGET_TYPES.METRIC,
    title: 'Ingresos',
    metric: BI_METRICS.REVENUE,
    position: { x: 0, y: 0, w: 3, h: 2 },
  },
  {
    id: 'deals',
    type: BI_WIDGET_TYPES.METRIC,
    title: 'Negocios',
    metric: BI_METRICS.DEALS,
    position: { x: 3, y: 0, w: 3, h: 2 },
  },
  {
    id: 'winRate',
    type: BI_WIDGET_TYPES.METRIC,
    title: 'Tasa de Éxito',
    metric: BI_METRICS.WIN_RATE,
    position: { x: 6, y: 0, w: 3, h: 2 },
  },
  {
    id: 'pipeline',
    type: BI_WIDGET_TYPES.METRIC,
    title: 'Valor Pipeline',
    metric: BI_METRICS.PIPELINE_VALUE,
    position: { x: 9, y: 0, w: 3, h: 2 },
  },
  {
    id: 'revenueChart',
    type: BI_WIDGET_TYPES.LINE_CHART,
    title: 'Ingresos por Período',
    metric: BI_METRICS.REVENUE,
    position: { x: 0, y: 2, w: 6, h: 4 },
  },
  {
    id: 'dealsChart',
    type: BI_WIDGET_TYPES.BAR_CHART,
    title: 'Negocios por Etapa',
    metric: BI_METRICS.DEALS,
    position: { x: 6, y: 2, w: 6, h: 4 },
  },
  {
    id: 'funnel',
    type: BI_WIDGET_TYPES.FUNNEL,
    title: 'Embudo de Ventas',
    position: { x: 0, y: 6, w: 8, h: 5 },
  },
  {
    id: 'sources',
    type: BI_WIDGET_TYPES.PIE_CHART,
    title: 'Ingresos por Fuente',
    metric: BI_METRICS.REVENUE,
    position: { x: 8, y: 6, w: 4, h: 5 },
  },
];

export const formatMetricValue = (metric: string, value: number): string => {
  switch (metric) {
    case BI_METRICS.REVENUE:
    case BI_METRICS.PIPELINE_VALUE:
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(value);
    case BI_METRICS.WIN_RATE:
    case BI_METRICS.CONVERSION_RATE:
      return `${value.toFixed(1)}%`;
    case BI_METRICS.AVG_DEAL_SIZE:
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(value);
    case BI_METRICS.SALES_CYCLE:
      return `${value} días`;
    default:
      return value.toLocaleString('es-CO');
  }
};
