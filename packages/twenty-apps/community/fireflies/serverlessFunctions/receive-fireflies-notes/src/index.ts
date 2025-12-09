// Serverless function entry point - re-exports from src/lib
export { config, main } from '../../../src';
export type {
    FirefliesMeetingData,
    FirefliesParticipant,
    FirefliesWebhookPayload,
    ProcessResult,
    SummaryFetchConfig,
    SummaryStrategy
} from '../../../src';

