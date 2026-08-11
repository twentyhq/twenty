const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/;

const MILLISECONDS_PER_SECOND = 1000;

// Slack renders date tokens in each reader's own timezone and locale, and
// prints "today"/"tomorrow" when they apply, so an ISO value becomes a native
// date rather than a string we formatted for one arbitrary timezone
export const formatSlackAnswerValue = (value: string): string => {
  if (!ISO_DATE_PATTERN.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const epochSeconds = Math.floor(date.getTime() / MILLISECONDS_PER_SECOND);
  const fallback = date.toISOString().slice(0, 10);

  return `<!date^${epochSeconds}^{date_short_pretty}|${fallback}>`;
};
