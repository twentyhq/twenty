import { isString } from '@sniptt/guards';
import { getChatReferenceSegments } from 'twenty-shared/ai';

export const getChatReferencePlainText = (text: string) =>
  getChatReferenceSegments(text)
    .map((segment) => (isString(segment) ? segment : segment.displayName))
    .join('');
