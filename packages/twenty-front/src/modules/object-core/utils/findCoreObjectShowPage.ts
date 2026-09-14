import { type CoreObjectNameSingular } from 'twenty-shared/types';

import { CORE_OBJECT_SHOW_PAGES } from '@/object-core/constants/CoreObjectShowPages';

export const findCoreObjectShowPage = (objectNameSingular?: string | null) =>
  CORE_OBJECT_SHOW_PAGES[objectNameSingular as CoreObjectNameSingular];
