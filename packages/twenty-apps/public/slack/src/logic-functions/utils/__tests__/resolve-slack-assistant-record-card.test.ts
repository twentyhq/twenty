import { describe, expect, it } from 'vitest';

import { type SlackAssistantRecordCardPayload } from 'src/logic-functions/types/slack-assistant-record-card-payload.type';
import { resolveSlackAssistantRecordCard } from 'src/logic-functions/utils/resolve-slack-assistant-record-card';

const WORKSPACE_BASE_URL = 'https://acme.twenty.com';
const ACME_ID = '3f77d0b1-30a1-4c3d-9d02-2f2a9f6f9d10';
const GLOBEX_ID = '9a11b2c3-44d5-4e6f-8a9b-0c1d2e3f4a5b';
const ACME_URL = `${WORKSPACE_BASE_URL}/object/company/${ACME_ID}`;

const buildPayload = (
  overrides: Partial<SlackAssistantRecordCardPayload> = {},
): SlackAssistantRecordCardPayload => ({
  recordId: ACME_ID,
  title: 'ACME',
  subtitle: 'Software',
  fields: [
    { label: 'Stage', value: 'Proposal' },
    { label: 'Amount', value: '$120,000' },
  ],
  ...overrides,
});

const resolve = ({
  answerText,
  recordCardPayload = buildPayload(),
  workspaceBaseUrl = WORKSPACE_BASE_URL,
}: {
  answerText: string;
  recordCardPayload?: SlackAssistantRecordCardPayload;
  workspaceBaseUrl?: string;
}) =>
  resolveSlackAssistantRecordCard({
    answerText,
    recordCardPayload,
    workspaceBaseUrl,
  });

describe('resolveSlackAssistantRecordCard', () => {
  it('should resolve a card when the reply is about a single record', () => {
    expect(resolve({ answerText: `Moved [ACME](${ACME_URL}) to Proposal.` })).toEqual({
      recordId: ACME_ID,
      objectNameSingular: 'company',
      recordUrl: ACME_URL,
      title: 'ACME',
      subtitle: 'Software',
      fields: [
        { label: 'Stage', value: 'Proposal' },
        { label: 'Amount', value: '$120,000' },
      ],
    });
  });

  it('should drop the card when the reply lists more than one record', () => {
    expect(
      resolve({
        answerText: `- [ACME](${ACME_URL})\n- [Globex](${WORKSPACE_BASE_URL}/object/company/${GLOBEX_ID})`,
      }),
    ).toBeUndefined();
  });

  it('should drop the card when the reply links no record', () => {
    expect(resolve({ answerText: 'No matching company.' })).toBeUndefined();
  });

  it('should drop a card pointing at a record the reply never linked', () => {
    expect(
      resolve({
        answerText: `Moved [ACME](${ACME_URL}) to Proposal.`,
        recordCardPayload: buildPayload({ recordId: GLOBEX_ID }),
      }),
    ).toBeUndefined();
  });

  it('should drop a card that carries no usable field', () => {
    expect(
      resolve({
        answerText: `Moved [ACME](${ACME_URL}) to Proposal.`,
        recordCardPayload: buildPayload({
          fields: [{ label: ' ', value: 'Proposal' }],
        }),
      }),
    ).toBeUndefined();
  });

  it('should fall back to the link label when the card has no title', () => {
    expect(
      resolve({
        answerText: `Moved [ACME](${ACME_URL}) to Proposal.`,
        recordCardPayload: buildPayload({ title: undefined }),
      })?.title,
    ).toBe('ACME');
  });

  it('should flatten Markdown and escape Slack control characters in card text', () => {
    expect(
      resolve({
        answerText: `Moved [ACME](${ACME_URL}) to Proposal.`,
        recordCardPayload: buildPayload({
          fields: [
            { label: 'Owner', value: '**[Jane Doe](https://x.test)** <jane>' },
          ],
        }),
      })?.fields,
    ).toEqual([{ label: 'Owner', value: 'Jane Doe &lt;jane&gt;' }]);
  });

  it('should keep at most six fields', () => {
    expect(
      resolve({
        answerText: `Moved [ACME](${ACME_URL}) to Proposal.`,
        recordCardPayload: buildPayload({
          fields: Array.from({ length: 9 }, (_unused, index) => ({
            label: `Label ${index}`,
            value: `Value ${index}`,
          })),
        }),
      })?.fields,
    ).toHaveLength(6);
  });

  it('should drop the card when the agent sent none', () => {
    expect(
      resolveSlackAssistantRecordCard({
        answerText: `Moved [ACME](${ACME_URL}) to Proposal.`,
        recordCardPayload: undefined,
        workspaceBaseUrl: WORKSPACE_BASE_URL,
      }),
    ).toBeUndefined();
  });

  it('should drop the card when record links are disabled', () => {
    expect(
      resolveSlackAssistantRecordCard({
        answerText: `Moved [ACME](${ACME_URL}) to Proposal.`,
        recordCardPayload: buildPayload(),
        workspaceBaseUrl: undefined,
      }),
    ).toBeUndefined();
  });
});
