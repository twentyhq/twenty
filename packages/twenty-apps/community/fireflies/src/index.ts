// Main exports for the Fireflies integration
export { config, main } from './receive-fireflies-notes';

// Types
export type {
    FirefliesMeetingData,
    FirefliesParticipant,
    FirefliesWebhookPayload,
    ProcessResult,
    SummaryFetchConfig,
    SummaryStrategy
} from './types';

// Services (for advanced usage)
export { FirefliesApiClient } from './fireflies-api-client';
export { MeetingFormatter } from './formatters';
export { TwentyCrmService } from './twenty-crm-service';
export { WebhookHandler } from './webhook-handler';

// Objects
export { Meeting } from './objects';

// Utilities
export { createLogger } from './logger';
export { getApiUrl, getSummaryFetchConfig, shouldAutoCreateContacts, toBoolean } from './utils';
export {
    getWebhookSecretFingerprint,
    isValidFirefliesPayload,
    verifyWebhookSignature
} from './webhook-validator';

