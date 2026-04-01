export const BADGE_TYPES = [
  { 
    key: 'DEALS_WON', 
    label: 'Negocios Ganados', 
    icon: 'IconTrophy',
    criteria: [5, 10, 25, 50, 100] 
  },
  { 
    key: 'REVENUE', 
    label: 'Ingresos', 
    icon: 'IconCurrencyDollar',
    criteria: [1000000, 5000000, 10000000, 50000000] 
  },
  { 
    key: 'DEALS_CREATED', 
    label: 'Oportunidades Creadas', 
    icon: 'IconPlus',
    criteria: [10, 25, 50, 100] 
  },
  { 
    key: 'TICKETS_RESOLVED', 
    label: 'Tickets Resueltos', 
    icon: 'IconCheck',
    criteria: [25, 50, 100, 200] 
  },
  { 
    key: 'STREAK', 
    label: 'Racha', 
    icon: 'IconFlame',
    criteria: [7, 14, 30, 60] 
  },
];

export const POINTS_CONFIG = {
  dealWon: 100,
  dealCreated: 10,
  ticketResolved: 5,
  emailSent: 1,
  meetingCompleted: 15,
  streak: 25,
};

export const LEADERBOARD_CONFIG = {
  periodOptions: [
    { key: 'WEEK', label: 'Esta Semana' },
    { key: 'MONTH', label: 'Este Mes' },
    { key: 'QUARTER', label: 'Este Trimestre' },
    { key: 'YEAR', label: 'Este Año' },
    { key: 'ALL_TIME', label: 'Todo el Tiempo' },
  ],
  metrics: [
    { key: 'POINTS', label: 'Puntos' },
    { key: 'DEALS_WON', label: 'Negocios' },
    { key: 'REVENUE', label: 'Ingresos' },
    { key: 'BADGES', label: 'Badges' },
  ],
};

export const GOAL_TYPES = [
  { key: 'DEALS', label: 'Negocios', metric: 'count' },
  { key: 'REVENUE', label: 'Ingresos', metric: 'currency' },
  { key: 'CALLS', label: 'Llamadas', metric: 'count' },
  { key: 'MEETINGS', label: 'Reuniones', metric: 'count' },
  { key: 'TICKETS', label: 'Tickets', metric: 'count' },
];

export const calculateLevel = (points: number): { level: number; title: string } => {
  const levels = [
    { min: 0, title: 'Novato' },
    { min: 500, title: 'Aprendiz' },
    { min: 1500, title: 'Junior' },
    { min: 3500, title: 'Intermedio' },
    { min: 7000, title: 'Senior' },
    { min: 15000, title: 'Experto' },
    { min: 30000, title: 'Maestro' },
    { min: 50000, title: 'Leyenda' },
  ];
  
  let level = 0;
  for (const l of levels) {
    if (points >= l.min) level++;
  }
  
  return { 
    level, 
    title: levels[levels.length - 1]?.title ?? 'Novato' 
  };
};
