import { defineJobConfig } from 'twenty-sdk/define';

export default defineJobConfig({
  key: 'post-card-api',
  limiter: { max: 10, durationMs: 60_000 },
});
