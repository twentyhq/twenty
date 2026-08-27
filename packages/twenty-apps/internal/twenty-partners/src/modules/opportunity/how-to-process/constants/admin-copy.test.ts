import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { OPPORTUNITY_STAGE_OPTIONS } from 'src/modules/opportunity/constants/opportunity-stage-options';

import {
  DEAL_BOARD_STAGE_LABELS,
  HOW_TO_PROCESS_STEPS,
} from './admin-copy';

const APPLICATION_OBJECT_SOURCE = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../application/objects/application.object.ts',
  ),
  'utf8',
);

describe('HOW_TO_PROCESS_STEPS', () => {
  it('uses Deals-board stage labels from OPPORTUNITY_STAGE_OPTIONS', () => {
    const expected = OPPORTUNITY_STAGE_OPTIONS.filter(
      (option) => option.position < 5,
    ).map((option) => option.label);

    expect(DEAL_BOARD_STAGE_LABELS).toEqual(expected);

    const winnerStep = HOW_TO_PROCESS_STEPS.find((step) => step.num === '06');
    expect(winnerStep?.body).toContain(expected.join(' → '));
  });

  it('states the six automations the operator must not double-do', () => {
    const text = HOW_TO_PROCESS_STEPS.map((step) =>
      [step.body, step.note, ...(step.bullets ?? [])].join('\n'),
    ).join('\n');

    expect(text).toMatch(/already Listed/i);
    expect(text).toMatch(/Discord/i);
    expect(text).toMatch(/daily digest/i);
    expect(text).toMatch(/Intro Sent At/i);
    expect(text).toMatch(/Listed.*off/i);
    expect(text).toMatch(/Won/i);
    expect(text).toMatch(/Declined/i);
    expect(text).toMatch(/Backup stays/i);
  });

  it('uses Application state labels from application.object.ts', () => {
    for (const label of ['Applied', 'Invited', 'Won', 'Declined', 'Backup']) {
      expect(APPLICATION_OBJECT_SOURCE).toContain(`label: '${label}'`);
    }

    const matchStep = HOW_TO_PROCESS_STEPS.find((step) => step.num === '04');
    expect(matchStep?.pills?.join(' ')).toMatch(/Applied/);
    expect(matchStep?.pills?.join(' ')).toMatch(/Invited/);
  });
});
