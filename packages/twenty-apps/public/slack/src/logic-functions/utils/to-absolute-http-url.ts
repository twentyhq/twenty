import { isDefined } from 'twenty-sdk/utils';

// Twenty stores bare domains like "goo.gle"; Slack link fields reject
// values without a scheme and fail the whole unfurl with
// error_processing_metadata.
export const toAbsoluteHttpUrl = (
  value: string | undefined,
): string | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(candidate).toString();
  } catch {
    return undefined;
  }
};
