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
    siteName: string;
    remainingBefore: number;
    durationMs: number;
  };

export abstract class SecretEncryptionRotationHandler {
  abstract readonly siteName: string;

  abstract countRemaining(args: {
    currentEncryptionKeyId: string;
  }): Promise<number>;

  abstract rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome>;
}
