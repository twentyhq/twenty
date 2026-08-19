import { describe, expect, it } from 'vitest';

import { extractSlackAssistantRecordCard } from 'src/logic-functions/utils/extract-slack-assistant-record-card';

const CARD_JSON =
  '{"recordId":"3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10","title":"ACME","subtitle":"Software","fields":[{"label":"Stage","value":"Proposal"}]}';

describe('extractSlackAssistantRecordCard', () => {
  it('should strip the card trailer and return the parsed payload', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      `Moved **ACME** to Proposal.\n\n<record-card>\n${CARD_JSON}\n</record-card>`,
    );

    expect(answerText).toBe('Moved **ACME** to Proposal.');
    expect(recordCardPayload).toEqual({
      recordId: '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10',
      title: 'ACME',
      subtitle: 'Software',
      fields: [{ label: 'Stage', value: 'Proposal' }],
    });
  });

  it('should unwrap a card the agent put inside a code fence', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      `Moved **ACME** to Proposal.\n\n\`\`\`json\n<record-card>\n${CARD_JSON}\n</record-card>\n\`\`\``,
    );

    expect(answerText).toBe('Moved **ACME** to Proposal.');
    expect(recordCardPayload?.recordId).toBe(
      '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10',
    );
  });

  it('should strip an unparsable card instead of leaking it to the member', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      'Moved **ACME** to Proposal.\n\n<record-card>not json</record-card>',
    );

    expect(answerText).toBe('Moved **ACME** to Proposal.');
    expect(recordCardPayload).toBeUndefined();
  });

  it('should recover a card the agent never closed and strip the open tag', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      `Moved **ACME** to Proposal.\n\n<record-card>\n${CARD_JSON}`,
    );

    expect(answerText).toBe('Moved **ACME** to Proposal.');
    expect(recordCardPayload?.recordId).toBe(
      '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10',
    );
  });

  it('should strip an open tag that carries nothing parsable', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      'Moved **ACME** to Proposal.\n\n<record-card>\nnot json',
    );

    expect(answerText).toBe('Moved **ACME** to Proposal.');
    expect(recordCardPayload).toBeUndefined();
  });

  it('should drop a card that carries no record id', () => {
    const { recordCardPayload } = extractSlackAssistantRecordCard(
      'Done.\n\n<record-card>{"title":"ACME","fields":[]}</record-card>',
    );

    expect(recordCardPayload).toBeUndefined();
  });

  it('should keep only well formed fields', () => {
    const { recordCardPayload } = extractSlackAssistantRecordCard(
      'Done.\n\n<record-card>{"recordId":"abc","fields":[{"label":"Stage","value":"Proposal"},{"label":"Amount"},"Owner"]}</record-card>',
    );

    expect(recordCardPayload?.fields).toEqual([
      { label: 'Stage', value: 'Proposal' },
    ]);
  });

  it('should read a card the agent fenced as a record-card block', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      `Moved **ACME** to Proposal.\n\n\`\`\`record-card\n${CARD_JSON}\n\`\`\``,
    );

    expect(answerText).toBe('Moved **ACME** to Proposal.');
    expect(recordCardPayload?.recordId).toBe(
      '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10',
    );
  });

  it('should read a trailing bare card object when the agent drops the tag', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      `Moved **ACME** to Proposal.\n\n${CARD_JSON}`,
    );

    expect(answerText).toBe('Moved **ACME** to Proposal.');
    expect(recordCardPayload?.recordId).toBe(
      '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10',
    );
  });

  it('should treat an empty card as no card and strip it', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      'Found 3 companies in Berlin.\n\n<record-card>{}</record-card>',
    );

    expect(answerText).toBe('Found 3 companies in Berlin.');
    expect(recordCardPayload).toBeUndefined();
  });

  it('should leave a reply without a card untouched', () => {
    const { answerText, recordCardPayload } = extractSlackAssistantRecordCard(
      'ACME has 3 open opportunities.',
    );

    expect(answerText).toBe('ACME has 3 open opportunities.');
    expect(recordCardPayload).toBeUndefined();
  });
});
