import { describe, expect, it } from 'vitest';

import { TEAMS_ANSWER_TEXT_MAX_LENGTH } from 'src/features/chat/logic-functions/constants/teams-answer-text-max-length';
import { buildTeamsAssistantAnswerText } from 'src/features/chat/logic-functions/utils/build-teams-assistant-answer-text';

const INPUT = {
  requestId: 'request-1',
  workspaceBaseUrl: 'https://acme.twenty.com',
};

const REQUEST_URL =
  'https://acme.twenty.com/object/teamsAssistantRequest/request-1';

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
    const responseText = line.repeat(
      Math.ceil(TEAMS_ANSWER_TEXT_MAX_LENGTH / line.length) + 5,
    );

    const answerText = buildTeamsAssistantAnswerText({
      ...INPUT,
      responseText,
    });

    const [keptText, notice] = answerText.split('\n\n_Shortened');

    expect(answerText.length).toBeLessThanOrEqual(TEAMS_ANSWER_TEXT_MAX_LENGTH);
    expect(keptText.endsWith(line.trim())).toBe(true);
    expect(`_Shortened${notice}`).toBe(
      `_Shortened to fit Teams. [Read the full answer in Twenty](${REQUEST_URL})_`,
    );
  });

  it('should not split an emoji when cutting a long answer', () => {
    const responseText = '👨‍👩‍👧‍👦'.repeat(TEAMS_ANSWER_TEXT_MAX_LENGTH);

    const answerText = buildTeamsAssistantAnswerText({
      ...INPUT,
      responseText,
    });

    expect(answerText.length).toBeLessThanOrEqual(TEAMS_ANSWER_TEXT_MAX_LENGTH);
    expect(answerText.split('\n\n_Shortened')[0]).toMatch(/^(👨‍👩‍👧‍👦)+$/u);
  });

  it('should name the request record when there is no workspace URL', () => {
    const answerText = buildTeamsAssistantAnswerText({
      ...INPUT,
      workspaceBaseUrl: undefined,
      responseText: 'word '.repeat(TEAMS_ANSWER_TEXT_MAX_LENGTH),
    });

    expect(answerText).toMatch(
      /_Shortened to fit Teams\. The full answer is on this request in Twenty\._$/,
    );
  });
});
