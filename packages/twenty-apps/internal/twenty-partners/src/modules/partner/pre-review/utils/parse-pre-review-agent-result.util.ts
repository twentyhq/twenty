import {
  type PreReviewVerdict,
  isPreReviewVerdict,
} from 'src/modules/partner/pre-review/constants/pre-review-verdict.constant';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export type PreReviewAgentOutput = {
  verdict: PreReviewVerdict;
  headline: string;
  evidence: string[];
  flags: string[];
  needsHumanLook: string[];
};

// The agent response schema only carries flat primitives, so the model returns
// each list as newline-separated text.
const toLines = (value: unknown): string[] =>
  typeof value !== 'string'
    ? []
    : value
        .split('\n')
        .map((entry) => entry.replace(/^\s*[-*•]\s*/, '').trim())
        .filter(isNonEmptyString);

export const parsePreReviewAgentResult = (
  result: object | null,
): PreReviewAgentOutput | null => {
  if (result === null) return null;

  const record = result as Record<string, unknown>;
  const verdict = record.verdict;
  const headline = record.headline;

  if (!isPreReviewVerdict(verdict)) return null;
  if (!isNonEmptyString(headline)) return null;

  return {
    verdict,
    headline: headline.trim(),
    evidence: toLines(record.evidence),
    flags: toLines(record.flags),
    needsHumanLook: toLines(record.needsHumanLook),
  };
};
