import { realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const getAppTemplateOverlayDirectory = () =>
  join(dirname(realpathSync(process.argv[1] ?? '')), 'app-template-overlay');
