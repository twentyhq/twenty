import { describe, expect, it } from 'vitest';

import {
  consolidateReviews,
  type ReviewEventForConsolidation,
} from 'src/modules/github/pull-request-review/utils/consolidate-reviews';
import {
  buildConsolidatedRow,
  buildReviewKey,
  buildConsolidatedTitle,
} from 'src/modules/github/pull-request-review/utils/build-consolidated-row';

const evt = (
  state: ReviewEventForConsolidation['state'],
  submittedAt: string | null,
): ReviewEventForConsolidation => ({ state, submittedAt });

describe('consolidateReviews', () => {
  it('throws on empty input', () => {
    expect(() => consolidateReviews([])).toThrow();
  });

  it('returns a verdict for a single COMMENTED event', () => {
    const verdict = consolidateReviews([evt('COMMENTED', '2025-04-01T10:00:00Z')]);
    expect(verdict).toEqual({
      state: 'COMMENTED',
      firstSubmittedAt: '2025-04-01T10:00:00Z',
      lastSubmittedAt: '2025-04-01T10:00:00Z',
      eventCount: 1,
    });
  });

  it('picks the earliest substantive event when COMMENTED → APPROVED → COMMENTED', () => {
    const verdict = consolidateReviews([
      evt('COMMENTED', '2025-04-01T10:00:00Z'),
      evt('APPROVED', '2025-04-02T10:00:00Z'),
      evt('COMMENTED', '2025-04-03T10:00:00Z'),
    ]);
    expect(verdict).toEqual({
      state: 'APPROVED',
      firstSubmittedAt: '2025-04-02T10:00:00Z',
      lastSubmittedAt: '2025-04-03T10:00:00Z',
      eventCount: 3,
    });
  });

  it('keeps CHANGES_REQUESTED when it precedes APPROVED', () => {
    const verdict = consolidateReviews([
      evt('CHANGES_REQUESTED', '2025-04-01T08:00:00Z'),
      evt('APPROVED', '2025-04-05T08:00:00Z'),
    ]);
    expect(verdict.state).toBe('CHANGES_REQUESTED');
    expect(verdict.firstSubmittedAt).toBe('2025-04-01T08:00:00Z');
    expect(verdict.lastSubmittedAt).toBe('2025-04-05T08:00:00Z');
    expect(verdict.eventCount).toBe(2);
  });

  it('falls back to first event when only DISMISSED entries exist', () => {
    const verdict = consolidateReviews([
      evt('DISMISSED', '2025-04-02T08:00:00Z'),
      evt('DISMISSED', '2025-04-03T08:00:00Z'),
    ]);
    expect(verdict.state).toBe('DISMISSED');
    expect(verdict.firstSubmittedAt).toBe('2025-04-02T08:00:00Z');
    expect(verdict.lastSubmittedAt).toBe('2025-04-03T08:00:00Z');
    expect(verdict.eventCount).toBe(2);
  });

  it('handles only COMMENTED entries', () => {
    const verdict = consolidateReviews([
      evt('COMMENTED', '2025-04-01T10:00:00Z'),
      evt('COMMENTED', '2025-04-02T10:00:00Z'),
    ]);
    expect(verdict.state).toBe('COMMENTED');
    expect(verdict.firstSubmittedAt).toBe('2025-04-01T10:00:00Z');
    expect(verdict.lastSubmittedAt).toBe('2025-04-02T10:00:00Z');
  });

  it('is order-independent', () => {
    const a = consolidateReviews([
      evt('COMMENTED', '2025-04-01T10:00:00Z'),
      evt('APPROVED', '2025-04-02T10:00:00Z'),
    ]);
    const b = consolidateReviews([
      evt('APPROVED', '2025-04-02T10:00:00Z'),
      evt('COMMENTED', '2025-04-01T10:00:00Z'),
    ]);
    expect(a).toEqual(b);
  });

  it('handles null submittedAt by treating it as the earliest', () => {
    const verdict = consolidateReviews([
      evt('APPROVED', '2025-04-01T10:00:00Z'),
      evt('COMMENTED', null),
    ]);
    expect(verdict.eventCount).toBe(2);
    expect(verdict.state).toBe('APPROVED');
  });
});

describe('buildReviewKey', () => {
  it('joins pullRequestId and reviewerId with a colon', () => {
    expect(buildReviewKey('pr-1', 'rev-2')).toBe('pr-1:rev-2');
  });

  it('uses "unknown" when reviewerId is null', () => {
    expect(buildReviewKey('pr-1', null)).toBe('pr-1:unknown');
  });
});

describe('buildConsolidatedTitle', () => {
  it('formats reviewer login + PR number', () => {
    expect(buildConsolidatedTitle('alice', 42)).toBe('alice on PR #42');
  });

  it('falls back gracefully on missing data', () => {
    expect(buildConsolidatedTitle(null, null)).toBe('unknown on PR #?');
  });
});

describe('buildConsolidatedRow', () => {
  it('produces the expected upsert payload', () => {
    const row = buildConsolidatedRow({
      pullRequestId: 'pr-1',
      reviewerId: 'rev-2',
      prNumber: 7,
      reviewerLogin: 'alice',
      events: [
        evt('COMMENTED', '2025-04-01T10:00:00Z'),
        evt('APPROVED', '2025-04-02T10:00:00Z'),
        evt('COMMENTED', '2025-04-03T10:00:00Z'),
      ],
    });
    expect(row).toEqual({
      reviewKey: 'pr-1:rev-2',
      title: 'alice on PR #7',
      state: 'APPROVED',
      firstSubmittedAt: '2025-04-02T10:00:00Z',
      lastSubmittedAt: '2025-04-03T10:00:00Z',
      eventCount: 3,
      reviewerId: 'rev-2',
      pullRequestId: 'pr-1',
    });
  });
});
