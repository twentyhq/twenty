export type FirewallEnforcementContext =
  | 'search_filter'
  | 'ai_context'
  | 'client_report'
  | 'slate_presentation'
  | 'pipeline_automation'
  | 'selection_context';

export type FirewallProhibitedSelector =
  | 'subscription_tier'
  | 'plan_level'
  | 'is_premium'
  | 'stripe_customer_id'
  | 'purchase_payment_history'
  | 'marketing_opt_in'
  | 'learning_activity'
  | 'course_completion'
  | 'quiz_activity'
  | 'content_consumption'
  | 'profile_views'
  | 'marketing_engagement'
  | 'candidate_service_usage_frequency'
  | 'executive_psychographic'
  | 'photo_analysis_scores'
  | 'birthdate'
  | 'gender'
  | 'voluntary_demographics'
  | 'accommodation_medical_info'
  | 'unreviewed_culture_fit_score';

export type FirewallProhibitedStatus = 'PROHIBITED';

export type FirewallProhibitedEntry = {
  context: FirewallEnforcementContext;
  rule: string;
  selector: FirewallProhibitedSelector;
  status: FirewallProhibitedStatus;
};

export const FIREWALL_PROHIBITED_ENTRIES: readonly FirewallProhibitedEntry[] = [
  {
    context: 'search_filter',
    rule: 'executives.subscription_tier must not appear in any recruiter search scoring or filter',
    selector: 'subscription_tier',
    status: 'PROHIBITED',
  },
  {
    context: 'ai_context',
    rule: 'subscription data must not enter AI candidate assessment context',
    selector: 'subscription_tier',
    status: 'PROHIBITED',
  },
  {
    context: 'client_report',
    rule: 'subscription data must not appear in client-facing reports',
    selector: 'subscription_tier',
    status: 'PROHIBITED',
  },
  {
    context: 'slate_presentation',
    rule: 'subscription data must not appear in candidate presentations or slates',
    selector: 'subscription_tier',
    status: 'PROHIBITED',
  },
  {
    context: 'pipeline_automation',
    rule: 'subscription data must not drive stage transitions or workflow automation',
    selector: 'subscription_tier',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'executives.plan_level excluded from search',
    selector: 'plan_level',
    status: 'PROHIBITED',
  },
  {
    context: 'ai_context',
    rule: 'plan level excluded from AI',
    selector: 'plan_level',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'executives.is_premium excluded from search',
    selector: 'is_premium',
    status: 'PROHIBITED',
  },
  {
    context: 'client_report',
    rule: 'premium status excluded from client reports',
    selector: 'is_premium',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'payment data excluded from all search delivery',
    selector: 'stripe_customer_id',
    status: 'PROHIBITED',
  },
  {
    context: 'ai_context',
    rule: 'payment data excluded from AI',
    selector: 'stripe_customer_id',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'payment history excluded from search',
    selector: 'purchase_payment_history',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'marketing engagement excluded from search',
    selector: 'marketing_opt_in',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'learning activity excluded unless explicit job-related credential',
    selector: 'learning_activity',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'course completion excluded unless candidate-authorized and job-related',
    selector: 'course_completion',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'quiz activity excluded from search',
    selector: 'quiz_activity',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'content consumption excluded from search',
    selector: 'content_consumption',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'profile view counts excluded from search',
    selector: 'profile_views',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'marketing engagement excluded from search',
    selector: 'marketing_engagement',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'candidate-service usage excluded from search',
    selector: 'candidate_service_usage_frequency',
    status: 'PROHIBITED',
  },
  {
    context: 'selection_context',
    rule: 'psychographic data not allowed in automated selection by default',
    selector: 'executive_psychographic',
    status: 'PROHIBITED',
  },
  {
    context: 'selection_context',
    rule: 'photo analysis/scores excluded from selection',
    selector: 'photo_analysis_scores',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'birthdate excluded from search/rank',
    selector: 'birthdate',
    status: 'PROHIBITED',
  },
  {
    context: 'ai_context',
    rule: 'birthdate excluded from AI context',
    selector: 'birthdate',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'gender excluded from search/rank',
    selector: 'gender',
    status: 'PROHIBITED',
  },
  {
    context: 'ai_context',
    rule: 'gender excluded from AI context',
    selector: 'gender',
    status: 'PROHIBITED',
  },
  {
    context: 'search_filter',
    rule: 'individual voluntary demographics excluded from search',
    selector: 'voluntary_demographics',
    status: 'PROHIBITED',
  },
  {
    context: 'ai_context',
    rule: 'individual voluntary demographics excluded from AI',
    selector: 'voluntary_demographics',
    status: 'PROHIBITED',
  },
  {
    context: 'selection_context',
    rule: 'medical/accommodation data excluded from evaluators',
    selector: 'accommodation_medical_info',
    status: 'PROHIBITED',
  },
  {
    context: 'selection_context',
    rule: 'unreviewed AI culture-fit/success-probability excluded from progression',
    selector: 'unreviewed_culture_fit_score',
    status: 'PROHIBITED',
  },
];

export const FIREWALL_PROHIBITED_SELECTORS: readonly FirewallProhibitedSelector[] =
  [
    'subscription_tier',
    'plan_level',
    'is_premium',
    'stripe_customer_id',
    'purchase_payment_history',
    'marketing_opt_in',
    'learning_activity',
    'course_completion',
    'quiz_activity',
    'content_consumption',
    'profile_views',
    'marketing_engagement',
    'candidate_service_usage_frequency',
    'executive_psychographic',
    'photo_analysis_scores',
    'birthdate',
    'gender',
    'voluntary_demographics',
    'accommodation_medical_info',
    'unreviewed_culture_fit_score',
  ];

export const FIREWALL_ENFORCEMENT_CONTEXTS: readonly FirewallEnforcementContext[] =
  [
    'search_filter',
    'ai_context',
    'client_report',
    'slate_presentation',
    'pipeline_automation',
    'selection_context',
  ];

export function isSelectorProhibitedInContext(
  selector: FirewallProhibitedSelector,
  context: FirewallEnforcementContext,
): boolean {
  return FIREWALL_PROHIBITED_ENTRIES.some(
    (entry) => entry.selector === selector && entry.context === context,
  );
}

export function getProhibitedSelectorsForContext(
  context: FirewallEnforcementContext,
): FirewallProhibitedSelector[] {
  return FIREWALL_PROHIBITED_ENTRIES.filter(
    (entry) => entry.context === context,
  ).map((entry) => entry.selector);
}
