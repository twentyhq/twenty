// Ciphertext envelope format used by SecretEncryptionService.
//
// v1 (legacy, decrypt-only): `enc:v1:<base64>` — AES-256-CTR with the raw
// key derivation. Produced by the previous ConnectedAccountTokenEncryption
// service before this PR; we keep decrypt support for the rollout window.
//
// v2 (current): `enc:v2:<keyId>:<base64>` — AES-256-GCM with an HKDF-derived
// per-context key. `keyId` is an 8-hex-char fingerprint of the raw key and
// lets every row identify which physical key encrypted it.
//
// Anything else is treated as legacy unprefixed CTR by the service and
// decrypted via the v1 raw-key path with a deprecation warning.

export const ENVELOPE_PREFIX = 'enc:';
export const ENVELOPE_V1_PREFIX = 'enc:v1:';
export const ENVELOPE_V2_PREFIX = 'enc:v2:';

export type ParsedEnvelope =
  | { version: 1; payload: string }
  | { version: 2; keyId: string; payload: string }
  | { version: null };

export const parseEnvelope = (value: string): ParsedEnvelope => {
  if (!value.startsWith(ENVELOPE_PREFIX)) {
    return { version: null };
  }

  if (value.startsWith(ENVELOPE_V1_PREFIX)) {
    return { version: 1, payload: value.slice(ENVELOPE_V1_PREFIX.length) };
  }

  if (value.startsWith(ENVELOPE_V2_PREFIX)) {
    const rest = value.slice(ENVELOPE_V2_PREFIX.length);
    const separatorIndex = rest.indexOf(':');

    if (separatorIndex <= 0) {
      throw new Error(
        'Malformed enc:v2 envelope: missing keyId separator. Expected enc:v2:<keyId>:<payload>.',
      );
    }

    const keyId = rest.slice(0, separatorIndex);
    const payload = rest.slice(separatorIndex + 1);

    return { version: 2, keyId, payload };
  }

  throw new Error(
    `Unknown ciphertext envelope version. Value starts with '${value.slice(0, 16)}'.`,
  );
};

export const formatV2Envelope = (
  keyId: string,
  payloadBase64: string,
): string => `${ENVELOPE_V2_PREFIX}${keyId}:${payloadBase64}`;
