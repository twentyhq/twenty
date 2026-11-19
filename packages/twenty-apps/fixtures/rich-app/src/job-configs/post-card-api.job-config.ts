import { defineJobConfig } from 'twenty-sdk/define';

export default defineJobConfig({
  universalIdentifier: '4c8006e5-38ab-4fac-a5f1-8012755413a2',
  key: 'post-card-api',
  limiter: { max: 10, durationMs: 60_000 },
});
