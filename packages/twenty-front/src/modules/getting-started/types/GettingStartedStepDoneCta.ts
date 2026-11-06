import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

export type GettingStartedStepDoneCta =
  | { type: 'chatThread'; chatThreadId: string }
  | { type: 'workflow'; stepActionKey: GettingStartedStepActionKey }
  | { type: 'invite' };
