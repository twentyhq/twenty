import { z } from 'zod';
import { pageviewSchema } from '../src/events';

export type Pageview = z.infer<typeof pageviewSchema>;
