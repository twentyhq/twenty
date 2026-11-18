import { getLinkedinProfileIdentifier } from 'src/logic-functions/utils/get-linkedin-profile-identifier.util';

export const getLinkedinProfileSlug = (url: string): string | null =>
  getLinkedinProfileIdentifier(url)?.toLowerCase() ?? null;
