import { z } from 'zod';

export const getValidInviteEmails = (
  emails: (string | undefined)[],
): string[] => [
  ...new Set(
    emails
      .map((email) => email?.trim())
      .filter((email): email is string => z.email().safeParse(email).success),
  ),
];
