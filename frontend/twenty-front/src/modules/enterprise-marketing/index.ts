// Components
export { AttributionView } from './components/AttributionView';
export { CampaignList } from './components/CampaignList';
export { LeadScoring } from './components/LeadScoring';

// Hooks
export { GET_CAMPAIGNS, GET_LEAD_SCORING_RULES, GET_ATTRIBUTION_DATA, CREATE_CAMPAIGN, LAUNCH_CAMPAIGN, PROCESS_LEAD_ACTION, GET_CAMPAIGN_ROI, HANDOFF_TO_SALES } from './hooks/useMarketing';

// States
export { campaignsState, marketingLoadingState, selectedCampaignIdState, marketingFilterState } from './states/marketingStates';

// Types
export type { CampaignStatus, CampaignChannel, CampaignData, LeadScoreRule, TouchPoint, AttributionModel } from './types/marketing.types';
