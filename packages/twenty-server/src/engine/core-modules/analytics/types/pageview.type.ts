import { z } from 'zod';

import { pageviewSchema } from 'src/engine/core-modules/analytics/utils/pageview/pageview';

export type AnalyticsPageview = z.infer<typeof pageviewSchema>;
