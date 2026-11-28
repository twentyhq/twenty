import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type UnipileUserProfile = UnipileUser & {
  emails?: string[];
  phone_numbers?: string[];
  specifics?: {
    [key: string]: unknown;
    experience?: { job_title?: string; ended_on?: string }[];
  } | null;
};
