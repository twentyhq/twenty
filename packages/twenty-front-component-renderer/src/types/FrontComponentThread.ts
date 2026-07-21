import { type ThreadMessagePort } from '@quilted/threads';

import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { type WorkerExports } from '@/types/WorkerExports';

export type FrontComponentThread = ThreadMessagePort<
  WorkerExports,
  FrontComponentHostThreadExports
>;
