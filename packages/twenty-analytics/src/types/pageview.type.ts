import { z } from 'zod';
import { pageviewSchema } from '../events';

export type Pageview = z.infer<typeof pageviewSchema>;
