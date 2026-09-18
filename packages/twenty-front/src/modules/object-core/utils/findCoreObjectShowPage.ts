import { isNonEmptyString } from '@sniptt/guards';

import { CORE_OBJECT_SHOW_PAGES } from '@/object-core/constants/CoreObjectShowPages';

export const findCoreObjectShowPage = (objectNameSingular?: string | null) =>
  isNonEmptyString(objectNameSingular)
    ? CORE_OBJECT_SHOW_PAGES.get(objectNameSingular)
    : undefined;
