import { describe, expect, it } from 'vitest';

import {
  buildInitialRows,
  deriveName,
  derivePublished,
  isBlankDraft,
  newDraftRow,
  toSaveBody,
  type CaseStudyRow,
} from './case-study-rows';

const persisted = (over: Partial<CaseStudyRow> = {}): CaseStudyRow => ({
  key: 'r1',
  id: 'r1',
  clientName: 'Acme',
  headline: 'Migration',
  bodyMarkdown: '## Hi',
  coverImageUrl: '',
  caseStudyLink: 'https://x.io',
  published: true,
  ...over,
});

describe('case-study-rows', () => {
  it('derives published from APPROVED status only', () => {
    expect(derivePublished('APPROVED')).toBe(true);
    expect(derivePublished('WIP')).toBe(false);
    expect(derivePublished(null)).toBe(false);
  });

  it('builds initial rows from the load payload (key = id, published from status)', () => {
    const rows = buildInitialRows([
      { id: 'a', name: 'n', clientName: 'C', headline: 'H', bodyMarkdown: 'B', coverImageUrl: null, caseStudyLink: 'https://y', status: 'APPROVED' },
      { id: 'b', name: null, clientName: null, headline: null, bodyMarkdown: null, coverImageUrl: null, caseStudyLink: null, status: 'WIP' },
    ]);
    expect(rows[0]).toMatchObject({ key: 'a', id: 'a', clientName: 'C', headline: 'H', bodyMarkdown: 'B', caseStudyLink: 'https://y', published: true });
    expect(rows[1]).toMatchObject({ key: 'b', id: 'b', clientName: '', headline: '', bodyMarkdown: '', caseStudyLink: '', published: false });
  });

  it('new draft rows have a unique key, no id, and default to draft', () => {
    const a = newDraftRow();
    const b = newDraftRow();
    expect(a.id).toBeUndefined();
    expect(a.published).toBe(false);
    expect(a.key).not.toBe(b.key);
  });

  it('derives name from headline, falling back when empty', () => {
    expect(deriveName(persisted({ headline: '  Rebuild  ' }))).toBe('Rebuild');
    expect(deriveName(persisted({ headline: '   ' }))).toBe('Case study');
  });

  it('treats an untouched new draft as blank, but not a filled or persisted row', () => {
    expect(isBlankDraft(newDraftRow())).toBe(true);
    expect(isBlankDraft(newDraftRow())).toBe(true);
    expect(isBlankDraft(persisted({ id: undefined, key: 'draft-x', headline: 'x' }))).toBe(false);
    expect(isBlankDraft(persisted())).toBe(false);
  });

  it('builds the save body: drops blank drafts, keeps id for persisted, carries published + derived name', () => {
    const rows = [persisted(), newDraftRow(), { ...newDraftRow(), headline: 'Fresh', published: true }];
    const body = toSaveBody(rows) as { caseStudies: Array<Record<string, unknown>> };
    expect(body.caseStudies).toHaveLength(2);
    expect(body.caseStudies[0]).toMatchObject({ id: 'r1', name: 'Migration', clientName: 'Acme', bodyMarkdown: '## Hi', caseStudyLink: 'https://x.io', published: true });
    expect(body.caseStudies[1]).toMatchObject({ name: 'Fresh', published: true });
    expect(body.caseStudies[1].id).toBeUndefined();
  });

  it('carries coverImageUrl into the save body and reads it from the load payload', () => {
    const rows = buildInitialRows([
      { id: 'a', name: 'n', clientName: 'C', headline: 'H', bodyMarkdown: 'B', coverImageUrl: 'https://img.example.com/a.png', caseStudyLink: 'https://y', status: 'APPROVED' },
    ]);
    expect(rows[0].coverImageUrl).toBe('https://img.example.com/a.png');

    const body = toSaveBody([persisted({ coverImageUrl: 'https://img.example.com/c.png' })]) as {
      caseStudies: Array<Record<string, unknown>>;
    };
    expect(body.caseStudies[0].coverImageUrl).toBe('https://img.example.com/c.png');
  });

  it('a new draft with only a cover URL set is not treated as blank', () => {
    expect(isBlankDraft({ ...newDraftRow(), coverImageUrl: 'https://img.example.com/x.png' })).toBe(false);
  });
});
