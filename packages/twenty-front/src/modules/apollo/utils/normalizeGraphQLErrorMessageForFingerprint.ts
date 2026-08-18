// Strips the parts of a GraphQL error message that vary per object, field or
// value, so that messages describing the same failure share a fingerprint.
export const normalizeGraphQLErrorMessageForFingerprint = (
  message: string,
): string =>
  message
    .replace(/Did you mean[^?]*\?/g, '')
    .replace(/"[^"]*"/g, '"?"')
    .replace(/'[^']*'/g, "'?'")
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      '?',
    )
    .replace(/\s+/g, ' ')
    .trim();
