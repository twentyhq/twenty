import { type ResolvedApplicationContentObject } from '@/settings/applications/types/ResolvedApplicationContentObject';

export type ApplicationContentObjectResolver = (
  objectUniversalIdentifier: string | null | undefined,
) => ResolvedApplicationContentObject | undefined;
