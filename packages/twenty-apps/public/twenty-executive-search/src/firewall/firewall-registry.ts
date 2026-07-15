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

export const FIREWALL_PROHIBITED_ENTRIES: FirewallProhibitedEntry[] = [
  {
    selector: 'subscription_tier',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'executives.subscription_tier must not appear in any recruiter search scoring or filter',
  },
  {
    selector: 'subscription_tier',
    context: 'ai_context',
    status: 'PROHIBITED',
    rule: 'subscription data must not enter AI candidate assessment context',
  },
  {
    selector: 'subscription_tier',
    context: 'client_report',
    status: 'PROHIBITED',
    rule: 'subscription data must not appear in client-facing reports',
  },
  {
    selector: 'subscription_tier',
    context: 'slate_presentation',
    status: 'PROHIBITED',
    rule: 'subscription data must not appear in candidate presentations or slates',
  },
  {
    selector: 'subscription_tier',
    context: 'pipeline_automation',
    status: 'PROHIBITED',
    rule: 'subscription data must not drive stage transitions or workflow automation',
  },
  {
    selector: 'plan_level',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'executives.plan_level excluded from search',
  },
  {
    selector: 'plan_level',
    context: 'ai_context',
    status: 'PROHIBITED',
    rule: 'plan level excluded from AI',
  },
  {
    selector: 'is_premium',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'executives.is_premium excluded from search',
  },
  {
    selector: 'is_premium',
    context: 'client_report',
    status: 'PROHIBITED',
    rule: 'premium status excluded from client reports',
  },
  {
    selector: 'stripe_customer_id',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'payment data excluded from all search delivery',
  },
  {
    selector: 'stripe_customer_id',
    context: 'ai_context',
    status: 'PROHIBITED',
    rule: 'payment data excluded from AI',
  },
  {
    selector: 'purchase_payment_history',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'payment history excluded from search',
  },
  {
    selector: 'marketing_opt_in',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'marketing engagement excluded from search',
  },
  {
    selector: 'learning_activity',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'learning activity excluded unless explicit job-related credential',
  },
  {
    selector: 'course_completion',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'course completion excluded unless candidate-authorized and job-related',
  },
  {
    selector: 'quiz_activity',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'quiz activity excluded from search',
  },
  {
    selector: 'content_consumption',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'content consumption excluded from search',
  },
  {
    selector: 'profile_views',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'profile view counts excluded from search',
  },
  {
    selector: 'marketing_engagement',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'marketing engagement excluded from search',
  },
  {
    selector: 'candidate_service_usage_frequency',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'candidate-service usage excluded from search',
  },
  {
    selector: 'executive_psychographic',
    context: 'selection_context',
    status: 'PROHIBITED',
    rule: 'psychographic data not allowed in automated selection by default',
  },
  {
    selector: 'photo_analysis_scores',
    context: 'selection_context',
    status: 'PROHIBITED',
    rule: 'photo analysis/scores excluded from selection',
  },
  {
    selector: 'birthdate',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'birthdate excluded from search/rank',
  },
  {
    selector: 'birthdate',
    context: 'ai_context',
    status: 'PROHIBITED',
    rule: 'birthdate excluded from AI context',
  },
  {
    selector: 'gender',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'gender excluded from search/rank',
  },
  {
    selector: 'gender',
    context: 'ai_context',
    status: 'PROHIBITED',
    rule: 'gender excluded from AI context',
  },
  {
    selector: 'voluntary_demographics',
    context: 'search_filter',
    status: 'PROHIBITED',
    rule: 'individual voluntary demographics excluded from search',
  },
  {
    selector: 'voluntary_demographics',
    context: 'ai_context',
    status: 'PROHIBITED',
    rule: 'individual voluntary demographics excluded from AI',
  },
  {
    selector: 'accommodation_medical_info',
    context: 'selection_context',
    status: 'PROHIBITED',
    rule: 'medical/accommodation data excluded from evaluators',
  },
  {
    selector: 'unreviewed_culture_fit_score',
    context: 'selection_context',
    status: 'PROHIBITED',
    rule: 'unreviewed AI culture-fit/success-probability excluded from progression',
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
  ] as const;

export const FIREWALL_ENFORCEMENT_CONTEXTS: readonly FirewallEnforcementContext[] =
  [
    'search_filter',
    'ai_context',
    'client_report',
    'slate_presentation',
    'pipeline_automation',
    'selection_context',
  ] as const;

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
