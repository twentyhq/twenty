import { describe, expect, it } from 'vitest';

import {
  buildContentCreateData,
  buildContentUpdateData,
  saveContentSchema,
} from './save-my-partner-content.logic-function';
import { canSubmitForReview } from './submit-partner-content-for-review.logic-function';

describe('saveContentSchema', () => {
  it('accepts a minimal case study (name only)', () => {
    expect(saveContentSchema.safeParse({ caseStudies: [{ name: 'Acme rollout' }] }).success).toBe(
      true,
    );
  });

  it('accepts an empty caseStudies array', () => {
    expect(saveContentSchema.safeParse({ caseStudies: [] }).success).toBe(true);
  });

  it('rejects a case study missing name', () => {
    expect(saveContentSchema.safeParse({ caseStudies: [{ clientName: 'Acme' }] }).success).toBe(
      false,
    );
  });
});

describe('buildContentCreateData', () => {
  it('includes contentType: [CASE_STUDY] and status: WIP', () => {
    const data = buildContentCreateData({ name: 'Acme rollout' }, 'partner-1');
    expect(data.contentType).toEqual(['CASE_STUDY']);
    expect(data.status).toBe('WIP');
    expect(data.partnerId).toBe('partner-1');
    expect(data.name).toBe('Acme rollout');
  });

  it('wraps bodyMarkdown into { markdown } (empty string when omitted)', () => {
    expect(buildContentCreateData({ name: 'x' }, 'p-1').body).toEqual({ markdown: '' });
    expect(
      buildContentCreateData({ name: 'x', bodyMarkdown: 'Hello **world**' }, 'p-1').body,
    ).toEqual({ markdown: 'Hello **world**' });
  });

  it('wraps caseStudyLink into { primaryLinkUrl } when present', () => {
    const data = buildContentCreateData(
      { name: 'x', caseStudyLink: 'https://example.com/case-study' },
      'p-1',
    );
    expect(data.caseStudyLink).toEqual({ primaryLinkUrl: 'https://example.com/case-study' });
  });

  it('leaves caseStudyLink undefined when not provided', () => {
    expect(buildContentCreateData({ name: 'x' }, 'p-1').caseStudyLink).toBeUndefined();
  });

  it('carries clientName and headline through untouched', () => {
    const data = buildContentCreateData(
      { name: 'x', clientName: 'Acme Corp', headline: 'A great migration' },
      'p-1',
    );
    expect(data.clientName).toBe('Acme Corp');
    expect(data.headline).toBe('A great migration');
  });
});

describe('buildContentUpdateData', () => {
  it('omits status and contentType', () => {
    const data = buildContentUpdateData({ name: 'Acme rollout (edited)' });
    expect(data).not.toHaveProperty('status');
    expect(data).not.toHaveProperty('contentType');
    expect(data).not.toHaveProperty('partnerId');
  });

  it('wraps bodyMarkdown and caseStudyLink the same way as create', () => {
    const data = buildContentUpdateData({
      name: 'x',
      bodyMarkdown: 'Updated body',
      caseStudyLink: 'https://example.com/updated',
    });
    expect(data.body).toEqual({ markdown: 'Updated body' });
    expect(data.caseStudyLink).toEqual({ primaryLinkUrl: 'https://example.com/updated' });
  });

  it('still maps name, clientName, headline', () => {
    const data = buildContentUpdateData({
      name: 'Acme rollout (edited)',
      clientName: 'Acme Corp',
      headline: 'A better migration',
    });
    expect(data.name).toBe('Acme rollout (edited)');
    expect(data.clientName).toBe('Acme Corp');
    expect(data.headline).toBe('A better migration');
  });
});

describe('canSubmitForReview', () => {
  it('returns true only for WIP', () => {
    expect(canSubmitForReview('WIP')).toBe(true);
  });

  it('returns false for every other status', () => {
    expect(canSubmitForReview('INTERVIEW_SCHEDULED')).toBe(false);
    expect(canSubmitForReview('UNDER_CUSTOMER_PARTNER_REVIEW')).toBe(false);
    expect(canSubmitForReview('APPROVED')).toBe(false);
    expect(canSubmitForReview('REJECTED')).toBe(false);
    expect(canSubmitForReview(null)).toBe(false);
  });
});
