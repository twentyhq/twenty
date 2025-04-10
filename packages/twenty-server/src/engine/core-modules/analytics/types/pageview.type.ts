import { z } from 'zod';

import { pageviewSchema } from 'src/engine/core-modules/analytics/utils/events/pageview/pageview';

export type AnalyticsPageview = z.infer<typeof pageviewSchema>;
