import { BillingPlanKey } from '../enums/billing-plan-key.enum';
import { BillingProductKey } from '../enums/billing-product-key.enum';

export const BILLING_PRICES_COP = {
  [BillingPlanKey.FREE]: {
    [BillingProductKey.BASE_PRODUCT]: {
      monthly: 0,
      yearly: 0,
    },
  },
  [BillingPlanKey.PRO]: {
    [BillingProductKey.BASE_PRODUCT]: {
      monthly: 79000,  // $79,000 COP/mes
      yearly: 790000,  // $790,000 COP/año (ahorro ~17%)
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

export const BILLING_PRICES_DISPLAY_COP = {
  [BillingPlanKey.FREE]: {
    monthly: {
      amount: 0,
      currency: 'COP',
      formatted: 'Gratis',
    },
    yearly: {
      amount: 0,
      currency: 'COP',
      formatted: 'Gratis',
    },
  },
  [BillingPlanKey.PRO]: {
    monthly: {
      amount: 79000,
      currency: 'COP',
      formatted: '$79,000/mes',
    },
    yearly: {
      amount: 790000,
      currency: 'COP',
      formatted: '$790,000/año',
      savings: 'Ahorra $158,000 (17%)',
    },
  },
  [BillingPlanKey.ENTERPRISE]: {
    monthly: {
      amount: null,
      currency: 'COP',
      formatted: 'Contáctanos',
    },
    yearly: {
      amount: null,
      currency: 'COP',
      formatted: 'Contáctanos',
    },
  },
};

export const getPriceForPlan = (
  planKey: BillingPlanKey,
  interval: 'monthly' | 'yearly',
): number => {
  const prices = BILLING_PRICES_COP[planKey];
  if (!prices) return 0;

  const baseProduct = prices[BillingProductKey.BASE_PRODUCT];
  if (!baseProduct) return 0;

  return baseProduct[interval] ?? 0;
};

export const getFormattedPrice = (
  planKey: BillingPlanKey,
  interval: 'monthly' | 'yearly',
): string => {
  const display = BILLING_PRICES_DISPLAY_COP[planKey];
  if (!display) return 'N/A';

  return display[interval]?.formatted ?? 'N/A';
};
