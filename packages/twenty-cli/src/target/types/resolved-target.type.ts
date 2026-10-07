import { type CredentialKind } from '@/target/types/credential-kind.type';
import { type TargetSource } from '@/target/types/target-source.type';

export type ResolvedTarget = {
  apiUrl: string;
  bearerToken: string;
  credentialKind: CredentialKind;
  source: TargetSource;
  remoteName?: string;
};
