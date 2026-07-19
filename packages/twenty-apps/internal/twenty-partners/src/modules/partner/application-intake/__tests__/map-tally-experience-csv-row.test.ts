import { describe, expect, it } from 'vitest';

import {
  mapMilestoneLabels,
  mapTallyExperienceCsvRow,
  TWENTY_EXPERIENCE_NOTES_MIN_LENGTH,
} from '../utils/map-tally-experience-csv-row';

const VALID_PARTNER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const longNotes = (suffix = ''): string => {
  const base =
    'Built a Twenty workspace for Acme with custom objects, roles, and a sales pipeline. ';
  let notes = '';
  while (notes.length < TWENTY_EXPERIENCE_NOTES_MIN_LENGTH) {
    notes += base;
  }
  return `${notes}${suffix}`;
};

const validRow = (
  overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> => ({
  partnerId: VALID_PARTNER_ID,
  "What you've built in Twenty": 'Custom apps, Workflows',
  'Tell us about the implementation': longNotes(),
  'Proof URL': 'https://www.loom.com/share/abc123',
  Email: 'partner@example.com',
  ...overrides,
});

describe('mapMilestoneLabels', () => {
  it('maps the four canonical Tally labels to enums', () => {
    expect(
      mapMilestoneLabels(
        'Custom apps, Data models; Workflows\nFront components',
      ),
    ).toEqual({
      ok: true,
      milestones: [
        'CUSTOM_APPS',
        'DATA_MODELS',
        'WORKFLOWS',
        'FRONT_COMPONENTS',
      ],
    });
  });

  it('dedupes repeated labels', () => {
    expect(mapMilestoneLabels('Workflows, Workflows')).toEqual({
      ok: true,
      milestones: ['WORKFLOWS'],
    });
  });

  it('rejects unknown labels without guessing', () => {
    expect(mapMilestoneLabels('Custom apps, Integrations')).toEqual({
      ok: false,
      reason: 'unknown_milestone_label:Integrations',
    });
  });

  it('rejects empty milestone input', () => {
    expect(mapMilestoneLabels('   ')).toEqual({
      ok: false,
      reason: 'missing_milestones',
    });
  });
});

describe('mapTallyExperienceCsvRow', () => {
  it('maps a valid Tally row to an update intent by partnerId', () => {
    const notes = longNotes();
    const result = mapTallyExperienceCsvRow(
      validRow({ 'Tell us about the implementation': notes }),
    );

    expect(result).toEqual({
      ok: true,
      intent: {
        partnerId: VALID_PARTNER_ID,
        twentyExperience: ['CUSTOM_APPS', 'WORKFLOWS'],
        twentyExperienceNotes: notes.trim(),
        twentyExperienceProofLink: 'https://www.loom.com/share/abc123',
      },
    });
  });

  it('never falls back to email when partnerId is missing', () => {
    const result = mapTallyExperienceCsvRow(
      validRow({ partnerId: undefined, Email: 'partner@example.com' }),
    );

    expect(result).toEqual({ ok: false, reason: 'missing_partner_id' });
  });

  it('rejects invalid partnerId format', () => {
    const result = mapTallyExperienceCsvRow(
      validRow({ partnerId: 'not-a-uuid' }),
    );

    expect(result).toEqual({
      ok: false,
      reason: 'invalid_partner_id',
      partnerId: 'not-a-uuid',
    });
  });

  it('rejects narrative shorter than 200 characters', () => {
    const shortNotes = 'Too short for a real implementation narrative.';
    const result = mapTallyExperienceCsvRow(
      validRow({ 'Tell us about the implementation': shortNotes }),
    );

    expect(result).toEqual({
      ok: false,
      reason: `notes_too_short:${shortNotes.length}`,
      partnerId: VALID_PARTNER_ID,
    });
  });

  it('rejects missing proof URL', () => {
    const result = mapTallyExperienceCsvRow(
      validRow({ 'Proof URL': undefined }),
    );

    expect(result).toEqual({
      ok: false,
      reason: 'missing_proof_url',
      partnerId: VALID_PARTNER_ID,
    });
  });

  it('rejects non-http(s) proof URLs', () => {
    const result = mapTallyExperienceCsvRow(
      validRow({ 'Proof URL': 'ftp://files.example.com/case-study' }),
    );

    expect(result).toEqual({
      ok: false,
      reason: 'invalid_proof_url',
      partnerId: VALID_PARTNER_ID,
    });
  });

  it('rejects unknown milestone labels on the row', () => {
    const result = mapTallyExperienceCsvRow(
      validRow({
        "What you've built in Twenty": 'Custom apps, Self-hosting',
      }),
    );

    expect(result).toEqual({
      ok: false,
      reason: 'unknown_milestone_label:Self-hosting',
      partnerId: VALID_PARTNER_ID,
    });
  });

  it('resolves Tally-style headers with helper copy via partial match', () => {
    const result = mapTallyExperienceCsvRow({
      partnerId: VALID_PARTNER_ID,
      "What you've built in Twenty (select every area)": 'Data models',
      'Tell us about the implementation — min 200 chars': longNotes('x'),
      'Proof URL (Loom ok)': 'http://example.com/proof',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.intent.twentyExperience).toEqual(['DATA_MODELS']);
      expect(result.intent.twentyExperienceProofLink).toBe(
        'http://example.com/proof',
      );
    }
  });
});
