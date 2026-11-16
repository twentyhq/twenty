import { isNonEmptyString } from '@sniptt/guards';

type TabRouteHash = {
  tabId: string;
  sectionId?: string;
};

export const parseTabRouteHash = (hash: string): TabRouteHash => {
  const [tabId, ...sectionSegments] = hash.replace('#', '').split('/');
  const sectionId = sectionSegments.join('/');

  return isNonEmptyString(sectionId) ? { tabId, sectionId } : { tabId };
};
