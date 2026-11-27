import { describe, expect, it } from 'vitest';

import { buildTeamsMessageActivity } from 'src/features/chat/logic-functions/utils/build-teams-message-activity';

describe('buildTeamsMessageActivity', () => {
  it('should send the text as extended Markdown', () => {
    expect(
      buildTeamsMessageActivity({ text: '```ts\nconst a = 1;\n```' }),
    ).toEqual({
      type: 'message',
      textFormat: 'extendedmarkdown',
      text: '```ts\nconst a = 1;\n```',
    });
  });

  it('should keep the entities of the message', () => {
    expect(
      buildTeamsMessageActivity({
        text: 'Done',
        entities: [
          { type: 'streaminfo', streamId: 'stream-1', streamType: 'final' },
        ],
      }),
    ).toEqual({
      type: 'message',
      textFormat: 'extendedmarkdown',
      text: 'Done',
      entities: [
        { type: 'streaminfo', streamId: 'stream-1', streamType: 'final' },
      ],
    });
  });
});
