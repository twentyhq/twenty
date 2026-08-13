// The JSON scalar accepts any JSON value, not just objects — mapping it to
// Record<string, unknown> rejects valid array payloads (e.g. diarized
// transcripts) at compile time while the API accepts them at runtime.
export const COMMON_SCALAR_TYPES = {
  DateTime: 'string',
  JSON: 'string | number | boolean | null | unknown[] | Record<string, unknown>',
  UUID: 'string',
};
