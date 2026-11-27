import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type UnipileUserProfile = UnipileUser & {
  location?: string;
  emails?: string[];
  social_handles?: { x?: { url?: string } };
  specifics?: {
    [key: string]: unknown;
    experience?: { job_title?: string; ended_on?: string }[];
  } | null;
};
