import { realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { type AppWorkerLaunch } from '@/app/types/app-worker-launch.type';

export const getAppWorkerLaunch = (): AppWorkerLaunch => ({
  modulePath: join(
    dirname(realpathSync(process.argv[1] ?? '')),
    'app-worker.cjs',
  ),
  execArgv: [],
});
