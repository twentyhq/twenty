import { describe, expect, it } from 'vitest';

import {
  MIN_PITCH_LENGTH,
  PITCHABLE_STATES,
} from 'src/modules/application/apply/constants/apply-to-brief.constants';

import {
  HOW_TO_APPLY_BODY_LINKS,
  HOW_TO_APPLY_HEADER_LINKS,
  HOW_TO_APPLY_STEPS,
} from './partner-copy';

describe('HOW_TO_APPLY_STEPS', () => {
  it('uses MIN_PITCH_LENGTH for the pitch rule', () => {
    const applyStep = HOW_TO_APPLY_STEPS.find((step) => step.num === '02');
    expect(applyStep?.body).toContain(String(MIN_PITCH_LENGTH));
  });

  it('states one application, pitch not editable, and Won/Declined are not partner-set', () => {
    const text = HOW_TO_APPLY_STEPS.map((step) =>
      [step.body, step.note, ...(step.bullets ?? [])].join('\n'),
    ).join('\n');

    expect(text).toMatch(/one application per brief/i);
    expect(text).toMatch(/cannot edit/i);
    expect(text).toMatch(/Won/);
    expect(text).toMatch(/Declined/);
    expect(text).toMatch(/do not set those/i);
    expect(text).toMatch(/My Applications still shows the brief/i);
  });

  it('names unpitchable states as the complement of PITCHABLE_STATES', () => {
    const applyStep = HOW_TO_APPLY_STEPS.find((step) => step.num === '02');

    expect([...PITCHABLE_STATES].sort()).toEqual([
      'APPLIED',
      'BACKUP',
      'INVITED',
    ]);
    expect(applyStep?.note).toContain('Introduced');
    expect(applyStep?.note).toContain('Won');
    expect(applyStep?.note).toContain('Declined');
    expect(applyStep?.note).toMatch(/cannot take a pitch/i);
  });

  it('links Open Briefs and My Applications at the top, not Apply', () => {
    expect(HOW_TO_APPLY_HEADER_LINKS).toEqual([
      { label: 'Open Briefs', action: 'openBriefs' },
      { label: 'My Applications', action: 'myApplications' },
    ]);
    expect(HOW_TO_APPLY_BODY_LINKS).toBe(HOW_TO_APPLY_HEADER_LINKS);

    const applyStep = HOW_TO_APPLY_STEPS.find((step) => step.num === '02');
    expect(applyStep?.body).toMatch(/Apply at the top/i);
  });
});
