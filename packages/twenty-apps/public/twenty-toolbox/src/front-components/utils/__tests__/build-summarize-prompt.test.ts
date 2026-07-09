import { describe, expect, it } from 'vitest';

import { buildSummarizePrompt } from 'src/front-components/utils/build-summarize-prompt';
import { SUMMARIZE_TARGETS } from 'src/front-components/utils/summarize-target';

describe('buildSummarizePrompt', () => {
  const recordId = 'c03967d9-22df-4154-8722-002aadf1cbb8';

  it('should include the record label and id when a label is resolved', () => {
    const prompt = buildSummarizePrompt({
      target: SUMMARIZE_TARGETS.person,
      recordLabel: 'Jane Cooper',
      recordId,
    });

    expect(prompt).toBe(
      `Summarize what you know about the person "Jane Cooper" (record id: ${recordId}).`,
    );
  });

  it('should fall back to an id-only prompt when the label is null', () => {
    const prompt = buildSummarizePrompt({
      target: SUMMARIZE_TARGETS.company,
      recordLabel: null,
      recordId,
    });

    expect(prompt).toBe(
      `Summarize what you know about the company with record id ${recordId}.`,
    );
  });

  it('should fall back to an id-only prompt when the label is blank', () => {
    const prompt = buildSummarizePrompt({
      target: SUMMARIZE_TARGETS.opportunity,
      recordLabel: '   ',
      recordId,
    });

    expect(prompt).toBe(
      `Summarize what you know about the opportunity with record id ${recordId}.`,
    );
  });

  it('should trim the record label', () => {
    const prompt = buildSummarizePrompt({
      target: SUMMARIZE_TARGETS.opportunity,
      recordLabel: ' Acme renewal ',
      recordId,
    });

    expect(prompt).toBe(
      `Summarize what you know about the opportunity "Acme renewal" (record id: ${recordId}).`,
    );
  });
});
