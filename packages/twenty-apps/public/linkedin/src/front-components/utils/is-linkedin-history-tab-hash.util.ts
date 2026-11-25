import { LINKEDIN_HISTORY_TAB_SLUG } from 'src/constants/linkedin-history-tab-slug.constant';

export const isLinkedinHistoryTabHash = (hash: string | undefined): boolean =>
  hash?.replace('#', '').split('/')[0] === LINKEDIN_HISTORY_TAB_SLUG;
