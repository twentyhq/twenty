import { z } from 'zod';

export const getValidInviteEmails = (
  emails: (string | undefined)[],
): string[] => [
  ...new Set(
    emails.filter(
      (email): email is string => z.email().safeParse(email).success,
    ),
  ),
];
