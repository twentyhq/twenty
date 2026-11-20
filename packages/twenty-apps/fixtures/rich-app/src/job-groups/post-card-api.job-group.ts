import { defineJobGroup } from 'twenty-sdk/define';

export const POST_CARD_API_JOB_GROUP_UNIVERSAL_IDENTIFIER =
  '4c8006e5-38ab-4fac-a5f1-8012755413a2';

export default defineJobGroup({
  universalIdentifier: POST_CARD_API_JOB_GROUP_UNIVERSAL_IDENTIFIER,
  name: 'post-card-api',
  limiter: { max: 10, durationMs: 60_000 },
});
