import { describe, expect, it } from 'vitest';

import { buildPreReviewNote } from './build-pre-review-note.mapper';

const agentOutput = {
  verdict: 'STRONG' as const,
  headline: 'Live Twenty instance with a real customer workflow.',
  evidence: [
    'crm.acme.com returns the Twenty app shell',
    'github.com/acme/twenty-app ships a custom app',
  ],
  flags: ['Company site never mentions Twenty'],
  needsHumanLook: ['LinkedIn profile — blocked to automated fetch: https://x'],
};

describe('buildPreReviewNote', () => {
  it('titles the note with the final verdict', () => {
    const note = buildPreReviewNote({
      verdict: 'WORTH_A_LOOK',
      agentOutput,
      evidencePack: {
        text: '',
        hasVerifiableProof: false,
        needsHumanLook: [],
      },
    });

    expect(note.title).toBe('Pre-review — WORTH A LOOK');
  });

  it('writes the headline, the evidence, the flags and the human-look list', () => {
    const note = buildPreReviewNote({
      verdict: 'STRONG',
      agentOutput,
      evidencePack: {
        text: '',
        hasVerifiableProof: true,
        needsHumanLook: ['Video not watched: https://loom.test/x'],
      },
    });

    expect(note.markdown).toContain(
      'Live Twenty instance with a real customer workflow.',
    );
    expect(note.markdown).toContain('## Evidence');
    expect(note.markdown).toContain('- crm.acme.com returns the Twenty app shell');
    expect(note.markdown).toContain('## Flags');
    expect(note.markdown).toContain('- Company site never mentions Twenty');
    expect(note.markdown).toContain('## Needs human look');
    expect(note.markdown).toContain('- Video not watched: https://loom.test/x');
    expect(note.markdown).toContain(
      '- LinkedIn profile — blocked to automated fetch: https://x',
    );
  });

  it('states the verdict cap when nothing verified', () => {
    const note = buildPreReviewNote({
      verdict: 'WORTH_A_LOOK',
      agentOutput: { ...agentOutput, verdict: 'STRONG' },
      evidencePack: {
        text: '',
        hasVerifiableProof: false,
        needsHumanLook: [],
      },
    });

    expect(note.markdown).toContain(
      'No proof could be verified automatically, so the verdict is capped at WORTH A LOOK (the model proposed STRONG).',
    );
  });

  it('says so plainly when there is nothing to flag', () => {
    const note = buildPreReviewNote({
      verdict: 'STRONG',
      agentOutput: { ...agentOutput, flags: [], needsHumanLook: [] },
      evidencePack: {
        text: '',
        hasVerifiableProof: true,
        needsHumanLook: [],
      },
    });

    expect(note.markdown).toContain('## Flags\n\nNone.');
    expect(note.markdown).toContain('## Needs human look\n\nNothing.');
  });
});
