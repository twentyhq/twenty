import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  DEAL_BOARD_STAGE_LABELS,
  DISCORD_CHAT_URL,
  HOW_TO_PROCESS_BODY_LINKS,
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
    const expected = ['New', 'Screening', 'Meeting', 'Proposal', 'Customer'];

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
    expect(text).toMatch(/Twenty Internal/);
    expect(text).not.toMatch(/\bTFT\b/);
    expect(text).toMatch(/daily digest/i);
    expect(text).toMatch(/Intro Sent At/i);
    expect(text).toMatch(/Listed.*off/i);
    expect(text).toMatch(/keep it in My Applications/i);
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

  it('names each skill, says run locally, and points at GitHub', () => {
    const prepareStep = HOW_TO_PROCESS_STEPS.find((step) => step.num === '02');
    const matchStep = HOW_TO_PROCESS_STEPS.find((step) => step.num === '04');
    const introStep = HOW_TO_PROCESS_STEPS.find((step) => step.num === '05');
    const leadBrief = prepareStep?.skills?.[0];
    const shortlist = matchStep?.skills?.[0];
    const intro = introStep?.skills?.[0];

    expect(prepareStep?.body).toMatch(/Design Doc URL/);
    expect(prepareStep?.body).not.toMatch(/run locally/i);
    expect(leadBrief?.name).toBe('twenty-lead-brief');
    expect(leadBrief?.trigger).toBe('/twenty-lead-brief');
    expect(leadBrief?.githubUrl).toContain(
      'src/skills/twenty-lead-brief/SKILL.md',
    );
    expect(leadBrief?.outputs.join('\n')).toMatch(/Design Doc URL/);
    expect(leadBrief?.outputs.join('\n')).toMatch(/partner-match-criteria/);

    expect(matchStep?.body).toContain('/twenty-partner-shortlist');
    expect(matchStep?.body).toContain('/twenty-lead-brief');
    expect(matchStep?.body).toContain('/twenty-partner-intro');
    expect(matchStep?.body).toMatch(/MCP/);
    expect(matchStep?.body).toMatch(/changes in the CRM/i);
    expect(shortlist?.name).toBe('twenty-partner-shortlist');
    expect(shortlist?.githubUrl).toContain(
      'src/skills/twenty-partner-shortlist/SKILL.md',
    );

    expect(introStep?.body).toContain('/twenty-partner-intro');
    expect(intro?.name).toBe('twenty-partner-intro');
    expect(intro?.githubUrl).toContain(
      'src/skills/twenty-partner-intro/SKILL.md',
    );
  });

  it('links Discord', () => {
    expect(HOW_TO_PROCESS_BODY_LINKS).toEqual([
      { label: 'Discord', href: DISCORD_CHAT_URL },
    ]);
    expect(DISCORD_CHAT_URL).toBe(
      'https://discord.com/channels/1130383047699738754/1513506376595538032',
    );
  });
});
