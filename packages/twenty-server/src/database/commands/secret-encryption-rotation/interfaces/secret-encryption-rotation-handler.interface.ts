import { type SecretEncryptionRotationSiteName } from 'src/database/commands/secret-encryption-rotation/constants/secret-encryption-rotation-site-name.constant';

export type SecretEncryptionRotationContext = {
  currentEncryptionKeyId: string;
  batchSize: number;
  dryRun: boolean;
};

export type SecretEncryptionRotationOutcome = {
  rotated: number;
  skipped: number;
  errors: number;
};

export type SecretEncryptionRotationSiteResult =
  SecretEncryptionRotationOutcome & {
    siteName: SecretEncryptionRotationSiteName;
    remainingBefore: number;
    durationMs: number;
  };

export abstract class SecretEncryptionRotationHandler {
  abstract readonly siteName: SecretEncryptionRotationSiteName;

  abstract countRemaining(args: {
    currentEncryptionKeyId: string;
  }): Promise<number>;

  abstract rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome>;
}
