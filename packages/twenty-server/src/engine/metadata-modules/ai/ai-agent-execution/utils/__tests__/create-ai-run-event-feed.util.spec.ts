import { type AiRunEvent } from 'twenty-shared/application';

import { createAiRunEventFeed } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/create-ai-run-event-feed.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const SOURCE = { runId: 'turn-id', createdAt: '2026-10-31T10:00:00.000Z' };

const STARTED: AiRunEvent = {
  ...SOURCE,
  id: 'turn-id:started',
  type: 'RUN_STARTED',
};
const PROMPT: AiRunEvent = {
  ...SOURCE,
  id: 'prompt-id:text:0',
  type: 'MESSAGE',
  role: 'user',
  text: 'Enrich Acme',
};

const buildCall = (toolCallId: string): AiRunEvent => ({
  ...SOURCE,
  id: `${toolCallId}:call`,
  type: 'TOOL_CALL',
  toolCallId,
  toolName: 'find_companies',
  input: {},
});

const buildResult = (toolCallId: string): AiRunEvent => ({
  ...SOURCE,
  id: `${toolCallId}:result`,
  type: 'TOOL_RESULT',
  toolCallId,
  output: {},
  isError: false,
});

const CALL_A = buildCall('call-a');
const RESULT_A = buildResult('call-a');
const CALL_B = buildCall('call-b');
const RESULT_B = buildResult('call-b');

const ids = (events: AiRunEvent[]) => events.map(({ id }) => id);

describe('createAiRunEventFeed', () => {
  it('hands out every event, then only the ones each read adds', () => {
    const feed = createAiRunEventFeed({});

    expect(ids(feed([[STARTED], [PROMPT]]))).toEqual(ids([STARTED, PROMPT]));
    expect(ids(feed([[STARTED], [PROMPT], [CALL_A]]))).toEqual(ids([CALL_A]));
    expect(feed([[STARTED], [PROMPT], [CALL_A]])).toEqual([]);
  });

  it('resumes after its cursor, and goes on without repeating it', () => {
    const feed = createAiRunEventFeed({ after: PROMPT.id });

    expect(ids(feed([[STARTED], [PROMPT], [CALL_A]]))).toEqual(ids([CALL_A]));
    expect(ids(feed([[STARTED], [PROMPT], [CALL_A, RESULT_A]]))).toEqual(
      ids([RESULT_A]),
    );
  });

  // B is called before A's result arrives, which is then listed beside A's call, ahead of B's
  it("resumes after a later call without losing an earlier call's result", () => {
    const liveFeed = createAiRunEventFeed({});

    expect(ids(liveFeed([[STARTED], [CALL_A, CALL_B]]))).toEqual(
      ids([STARTED, CALL_A, CALL_B]),
    );

    const resumedFeed = createAiRunEventFeed({ after: CALL_B.id });

    expect(
      ids(resumedFeed([[STARTED], [CALL_A, RESULT_A, CALL_B, RESULT_B]])),
    ).toEqual(ids([RESULT_A, RESULT_B]));
  });

  it("sends the step's other results again when resuming after a result", () => {
    const feed = createAiRunEventFeed({ after: RESULT_B.id });

    expect(
      ids(feed([[STARTED], [CALL_A, RESULT_A, CALL_B, RESULT_B], [PROMPT]])),
    ).toEqual(ids([RESULT_A, PROMPT]));
  });

  it('refuses a cursor that is not an event of the run', () => {
    expect(() =>
      createAiRunEventFeed({ after: 'unknown' })([[STARTED]]),
    ).toThrow(
      expect.objectContaining({ code: AiExceptionCode.INVALID_AGENT_INPUT }),
    );
  });
});
