import { type AiRunEvent } from 'twenty-shared/application';

import { createAiRunEventFeed } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/create-ai-run-event-feed.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const buildEvent = (id: string): AiRunEvent => ({
  id,
  runId: 'turn-id',
  type: 'RUN_STARTED',
  createdAt: '2026-10-31T10:00:00.000Z',
});

const STARTED = buildEvent('turn-id:started');
const PROMPT = buildEvent('prompt-id:text:0');
const CALL = buildEvent('call-id:call');
const RESULT = buildEvent('call-id:result');

const ids = (events: AiRunEvent[]) => events.map(({ id }) => id);

describe('createAiRunEventFeed', () => {
  it('hands out every event, then only the ones each read adds', () => {
    const feed = createAiRunEventFeed({});

    expect(ids(feed([STARTED, PROMPT]))).toEqual(ids([STARTED, PROMPT]));
    expect(ids(feed([STARTED, PROMPT, CALL]))).toEqual(ids([CALL]));
    expect(feed([STARTED, PROMPT, CALL])).toEqual([]);
  });

  it('resumes after its cursor, and goes on without repeating it', () => {
    const feed = createAiRunEventFeed({ after: PROMPT.id });

    expect(ids(feed([STARTED, PROMPT, CALL]))).toEqual(ids([CALL]));
    expect(ids(feed([STARTED, PROMPT, CALL, RESULT]))).toEqual(ids([RESULT]));
  });

  it('refuses a cursor that is not an event of the run', () => {
    expect(() => createAiRunEventFeed({ after: 'unknown' })([STARTED])).toThrow(
      expect.objectContaining({ code: AiExceptionCode.INVALID_AGENT_INPUT }),
    );
  });
});
