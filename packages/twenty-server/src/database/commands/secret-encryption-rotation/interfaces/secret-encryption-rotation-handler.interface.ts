import { type SecretEncryptionRotationSiteName } from 'src/database/commands/secret-encryption-rotation/constants/secret-encryption-rotation-site-entries.constant';

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

// `siteName` is `string` (not the registry-derived union) to break a TS
// circular reference: the registry value-imports dedicated handler classes
// (via `customHandler: HandlerClass`), and `SecretEncryptionRotationSiteName`
// is derived from `typeof <registry>`. Each concrete handler self-declares
// its `siteName` as an `as const` literal; the runner keys its map by the
// registry's typed `meta.siteName`, not by `handler.siteName`.
export abstract class SecretEncryptionRotationHandler {
  abstract readonly siteName: string;

  abstract countRemaining(args: {
    currentEncryptionKeyId: string;
  }): Promise<number>;

  abstract rotate(
    context: SecretEncryptionRotationContext,
  ): Promise<SecretEncryptionRotationOutcome>;
}
