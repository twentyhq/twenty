import { sanitizeEmailList } from '@/workspace/utils/sanitizeEmailList';
import { z } from 'zod';

export const getValidInviteEmails = (
  emails: (string | undefined)[],
): string[] =>
  sanitizeEmailList(
    emails.filter(
      (email): email is string => z.email().safeParse(email).success,
    ),
  );
