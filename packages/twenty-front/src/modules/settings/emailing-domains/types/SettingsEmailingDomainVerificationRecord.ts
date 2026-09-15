import { type VerificationRecord } from '~/generated-metadata/graphql';

export type SettingsEmailingDomainVerificationRecord = Pick<
  VerificationRecord,
  'type' | 'key' | 'value' | 'priority' | 'status' | 'purpose' | 'isRequired'
>;
