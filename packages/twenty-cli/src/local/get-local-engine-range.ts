import { isDefined } from 'twenty-shared/utils';

import { getEngineVersionRange } from '@/app/manifest/get-engine-version-range';
import { listAncestorDirectories } from '@/app/project/list-ancestor-directories';

export const getLocalEngineRange = () =>
  listAncestorDirectories(process.cwd())
    .map(getEngineVersionRange)
    .find(isDefined);
