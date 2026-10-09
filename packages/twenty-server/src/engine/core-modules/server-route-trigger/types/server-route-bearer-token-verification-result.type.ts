export type ServerRouteBearerTokenVerificationResult =
  | { isValid: true; claims: Record<string, unknown> }
  | { isValid: false; reason: string };
