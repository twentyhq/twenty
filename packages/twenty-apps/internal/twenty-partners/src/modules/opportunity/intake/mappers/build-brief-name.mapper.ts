const MAX_NEED_LENGTH = 60;

const MARKETPLACE_BRIEF_NAME_SUFFIX = '— marketplace brief';

// Listed briefs are visible to every partner, so the name must not carry the prospect's company.
export function buildBriefName(need: string): string {
  const trimmedNeed = need.trim();
  const shortNeed =
    trimmedNeed.length > MAX_NEED_LENGTH
      ? `${trimmedNeed.slice(0, MAX_NEED_LENGTH).trimEnd()}…`
      : trimmedNeed;
  return `${shortNeed} ${MARKETPLACE_BRIEF_NAME_SUFFIX}`;
}
