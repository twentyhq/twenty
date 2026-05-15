export type SecretEncryptionRotationHandlerOptions = {
  primaryKeyId: string;
  batchSize: number;
  dryRun: boolean;
};

export type SecretEncryptionRotationSiteResult = {
  siteName: string;
  remainingBefore: number;
  rotated: number;
  skipped: number;
  errors: number;
  durationMs: number;
};

export type SecretEncryptionRotationHandler = {
  readonly siteName: string;

  countRemaining(args: { primaryKeyId: string }): Promise<number>;

  run(
    options: SecretEncryptionRotationHandlerOptions,
  ): Promise<
    Pick<SecretEncryptionRotationSiteResult, 'rotated' | 'skipped' | 'errors'>
  >;
};
