export type SecretEncryptionRotationContext = {
  primaryKeyId: string;
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

export type SecretEncryptionRotationHandler = {
  readonly siteName: string;

  countRemaining(args: { primaryKeyId: string }): Promise<number>;

  rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome>;
};
