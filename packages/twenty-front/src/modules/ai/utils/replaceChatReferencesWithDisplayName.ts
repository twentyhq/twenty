import { isString } from '@sniptt/guards';

import { getChatReferenceSegments } from '@/ai/utils/getChatReferenceSegments';

export const replaceChatReferencesWithDisplayName = (text: string): string =>
  getChatReferenceSegments(text)
    .map((segment) => (isString(segment) ? segment : segment.displayName))
    .join('');
