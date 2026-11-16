import { describe, expect, it } from 'vitest';

import { TEAMS_ANSWER_TEXT_MAX_BYTES } from 'src/features/chat/logic-functions/constants/teams-answer-text-max-bytes';
import { buildTeamsAssistantAnswerText } from 'src/features/chat/logic-functions/utils/build-teams-assistant-answer-text';
import { countUtf8Bytes } from 'src/features/chat/logic-functions/utils/truncate-to-utf8-bytes';

const INPUT = {
  requestId: 'request-1',
  workspaceBaseUrl: 'https://acme.twenty.com',
};

const LINKED_NOTICE =
  '_Shortened to fit Teams. [Read the full answer in Twenty](https://acme.twenty.com/object/teamsAssistantRequest/request-1)_';

const splitNotice = (answerText: string): [string, string] => {
  const noticeIndex = answerText.lastIndexOf('\n\n_Shortened');

  return [
    answerText.slice(0, noticeIndex),
    answerText.slice(noticeIndex + '\n\n'.length),
  ];
};

describe('buildTeamsAssistantAnswerText', () => {
  it('should send a short answer as it is', () => {
    expect(
      buildTeamsAssistantAnswerText({
        ...INPUT,
        responseText: '**Acme** has 3 open deals.',
      }),
    ).toBe('**Acme** has 3 open deals.');
  });

  it('should cut a long answer on a line break and point to the full answer', () => {
    const line = 'Acme has 3 open deals worth $12,500 in total.\n';
    const answerText = buildTeamsAssistantAnswerText({
      ...INPUT,
      responseText: line.repeat(TEAMS_ANSWER_TEXT_MAX_BYTES / 10),
    });
    const [keptText, notice] = splitNotice(answerText);

    expect(countUtf8Bytes(answerText)).toBeLessThanOrEqual(
      TEAMS_ANSWER_TEXT_MAX_BYTES,
    );
    expect(keptText.endsWith(line.trim())).toBe(true);
    expect(notice).toBe(LINKED_NOTICE);
  });

  it('should budget bytes so multibyte text fits the Teams limit', () => {
    const answerText = buildTeamsAssistantAnswerText({
      ...INPUT,
      responseText: '客户 '.repeat(TEAMS_ANSWER_TEXT_MAX_BYTES / 5),
    });

    expect(countUtf8Bytes(answerText)).toBeLessThanOrEqual(
      TEAMS_ANSWER_TEXT_MAX_BYTES,
    );
    expect(splitNotice(answerText)[1]).toBe(LINKED_NOTICE);
  });

  it('should not split an emoji when cutting a long answer', () => {
    const answerText = buildTeamsAssistantAnswerText({
      ...INPUT,
      responseText: '👨‍👩‍👧‍👦'.repeat(TEAMS_ANSWER_TEXT_MAX_BYTES),
    });

    expect(countUtf8Bytes(answerText)).toBeLessThanOrEqual(
      TEAMS_ANSWER_TEXT_MAX_BYTES,
    );
    expect(splitNotice(answerText)[0]).toMatch(/^(👨‍👩‍👧‍👦)+$/u);
  });

  it('should close a code block the cut left open so the notice stays readable', () => {
    const answerText = buildTeamsAssistantAnswerText({
      ...INPUT,
      responseText: `Here is the export:\n\`\`\`csv\n${'name,amount\n'.repeat(TEAMS_ANSWER_TEXT_MAX_BYTES / 10)}\`\`\`\nDone.`,
    });
    const [keptText, notice] = splitNotice(answerText);

    expect(countUtf8Bytes(answerText)).toBeLessThanOrEqual(
      TEAMS_ANSWER_TEXT_MAX_BYTES,
    );
    expect(keptText.endsWith('\n```')).toBe(true);
    expect(keptText.split('```').length % 2).toBe(1);
    expect(notice).toBe(LINKED_NOTICE);
  });

  it('should name the request record when there is no workspace URL', () => {
    const answerText = buildTeamsAssistantAnswerText({
      ...INPUT,
      workspaceBaseUrl: undefined,
      responseText: 'word '.repeat(TEAMS_ANSWER_TEXT_MAX_BYTES),
    });

    expect(splitNotice(answerText)[1]).toBe(
      '_Shortened to fit Teams. The full answer is on this request in Twenty._',
    );
  });
});
