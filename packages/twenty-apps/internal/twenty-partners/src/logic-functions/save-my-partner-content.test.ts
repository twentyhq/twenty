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
  it('creates status: WIP and never writes partnerId/contentType (trigger stamps them)', () => {
    const data = buildContentCreateData({ name: 'Acme rollout' });
    expect(data.status).toBe('WIP');
    expect(data.name).toBe('Acme rollout');
    expect(data).not.toHaveProperty('partnerId');
    expect(data).not.toHaveProperty('contentType');
  });

  it('wraps bodyMarkdown into { markdown } (empty string when omitted)', () => {
    expect(buildContentCreateData({ name: 'x' }).body).toEqual({ markdown: '' });
    expect(
      buildContentCreateData({ name: 'x', bodyMarkdown: 'Hello **world**' }).body,
    ).toEqual({ markdown: 'Hello **world**' });
  });

  it('wraps caseStudyLink into { primaryLinkUrl } when present', () => {
    const data = buildContentCreateData({
      name: 'x',
      caseStudyLink: 'https://example.com/case-study',
    });
    expect(data.caseStudyLink).toEqual({ primaryLinkUrl: 'https://example.com/case-study' });
  });

  it('leaves caseStudyLink undefined when not provided', () => {
    expect(buildContentCreateData({ name: 'x' }).caseStudyLink).toBeUndefined();
  });

  it('carries clientName and headline through untouched', () => {
    const data = buildContentCreateData({
      name: 'x',
      clientName: 'Acme Corp',
      headline: 'A great migration',
    });
    expect(data.clientName).toBe('Acme Corp');
    expect(data.headline).toBe('A great migration');
  });

  it('passes coverImageUrl through when provided, and omits it when absent', () => {
    expect(buildContentCreateData({ name: 'x', coverImageUrl: 'https://img.example.com/c.png' }).coverImageUrl).toBe(
      'https://img.example.com/c.png',
    );
    expect(buildContentCreateData({ name: 'x' }).coverImageUrl).toBeUndefined();
  });
});

describe('buildContentUpdateData', () => {
  it('omits contentType and partnerId', () => {
    const data = buildContentUpdateData({ name: 'Acme rollout (edited)' });
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

  it('passes coverImageUrl through on update', () => {
    expect(buildContentUpdateData({ name: 'x', coverImageUrl: 'https://img.example.com/c.png' }).coverImageUrl).toBe(
      'https://img.example.com/c.png',
    );
  });
});

describe('partner-controlled publish', () => {
  it('creates a published case study as APPROVED', () => {
    const data = buildContentCreateData({ name: 'x', published: true });
    expect(data.status).toBe('APPROVED');
  });

  it('creates a draft (published false or omitted) as WIP', () => {
    expect(buildContentCreateData({ name: 'x', published: false }).status).toBe('WIP');
    expect(buildContentCreateData({ name: 'x' }).status).toBe('WIP');
  });

  it('updates status from the published flag', () => {
    expect(buildContentUpdateData({ name: 'x', published: true }).status).toBe('APPROVED');
    expect(buildContentUpdateData({ name: 'x', published: false }).status).toBe('WIP');
  });

  it('omits status when published is not specified, preserving the existing status', () => {
    expect(buildContentUpdateData({ name: 'x' })).not.toHaveProperty('status');
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
