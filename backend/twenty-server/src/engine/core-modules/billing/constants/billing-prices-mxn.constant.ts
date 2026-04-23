import { BillingPlanKey } from '../enums/billing-plan-key.enum';
import { BillingProductKey } from '../enums/billing-product-key.enum';
import { BillingUsageType } from '../enums/billing-usage-type.enum';

export const BILLING_PRICES_MXN = {
  [BillingPlanKey.FREE]: {
    [BillingProductKey.BASE_PRODUCT]: {
      monthly: 0,
      yearly: 0,
    },
  },
  [BillingPlanKey.PRO]: {
    [BillingProductKey.BASE_PRODUCT]: {
      monthly: 299,  // $299 MXN/mes
      yearly: 2990,  // $2,990 MXN/año (ahorro ~17%)
    },
  },
  [BillingPlanKey.ENTERPRISE]: {
    [BillingProductKey.BASE_PRODUCT]: {
      monthly: 0,    // Custom pricing
      yearly: 0,
    },
  },
};

export const BILLING_PLAN_FEATURES = {
  [BillingPlanKey.FREE]: {
    name: 'Free',
    description: 'Para equipos pequeños que inician',
    features: [
      'Hasta 2 usuarios',
      '1,000 registros',
      'CRM básico',
      'Dashboard',
      'Soporte por email',
      'Aplicaciones móviles',
    ],
    limits: {
      users: 2,
      records: 1000,
      aiCreditsPerMonth: 50,
    },
  },
  [BillingPlanKey.PRO]: {
    name: 'Pro',
    description: 'Para equipos en crecimiento',
    features: [
      'Hasta 10 usuarios',
      'Usuarios ilimitados',
      'CRM avanzado',
      'AI Assistant',
      'Workflows automatizados',
      'API Access',
      'Custom domains',
      'Reportes avanzados',
      'Priority support',
    ],
    limits: {
      users: 10,
      records: -1, // Unlimited
      aiCreditsPerMonth: 1000,
    },
  },
  [BillingPlanKey.ENTERPRISE]: {
    name: 'Enterprise',
    description: 'Para organizaciones grandes',
    features: [
      'Usuarios ilimitados',
      'Registros ilimitados',
      'Todo en Pro',
      'SSO/SAML',
      'Audit logs',
      'SLA garantizado',
      'Dedicated support',
      'On-premise option',
      'Custom integrations',
    ],
    limits: {
      users: -1,
      records: -1,
      aiCreditsPerMonth: -1,
    },
  },
};

export const BILLING_PRICES_DISPLAY_MXN = {
  [BillingPlanKey.FREE]: {
    monthly: {
      amount: 0,
      currency: 'MXN',
      formatted: 'Gratis',
    },
    yearly: {
      amount: 0,
      currency: 'MXN',
      formatted: 'Gratis',
    },
  },
  [BillingPlanKey.PRO]: {
    monthly: {
      amount: 299,
      currency: 'MXN',
      formatted: '$299/mes',
    },
    yearly: {
      amount: 2990,
      currency: 'MXN',
      formatted: '$2,990/año',
      savings: 'Ahorra $598 (17%)',
    },
  },
  [BillingPlanKey.ENTERPRISE]: {
    monthly: {
      amount: null,
      currency: 'MXN',
      formatted: 'Contáctanos',
    },
    yearly: {
      amount: null,
      currency: 'MXN',
      formatted: 'Contáctanos',
    },
  },
};

export const getPriceForPlan = (
  planKey: BillingPlanKey,
  interval: 'monthly' | 'yearly',
): number => {
  const prices = BILLING_PRICES_MXN[planKey];
  if (!prices) return 0;

  const baseProduct = prices[BillingProductKey.BASE_PRODUCT];
  if (!baseProduct) return 0;

  return baseProduct[interval] ?? 0;
};

export const getFormattedPrice = (
  planKey: BillingPlanKey,
  interval: 'monthly' | 'yearly',
): string => {
  const display = BILLING_PRICES_DISPLAY_MXN[planKey];
  if (!display) return 'N/A';

  return display[interval]?.formatted ?? 'N/A';
};

export const isPlanFree = (planKey: BillingPlanKey): boolean => {
  return planKey === BillingPlanKey.FREE;
};

export const isPlanPro = (planKey: BillingPlanKey): boolean => {
  return planKey === BillingPlanKey.PRO;
};

export const isPlanEnterprise = (planKey: BillingPlanKey): boolean => {
  return planKey === BillingPlanKey.ENTERPRISE;
};
