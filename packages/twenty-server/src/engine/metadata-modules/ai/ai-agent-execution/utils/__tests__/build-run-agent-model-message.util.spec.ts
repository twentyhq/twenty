import { type ResolvedRunAgentAttachment } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-run-agent-attachment.type';
import { buildRunAgentModelMessageOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-run-agent-model-message.util';

const FILE_ID = '6fdbd0ba-9a10-4b71-b0b7-2b1d64f8dc27';
const FILE_URL = `https://twenty.test/file/agent-chat/${FILE_ID}?token=t`;

const attachmentsByFileId = new Map<string, ResolvedRunAgentAttachment>([
  [FILE_ID, { mediaType: 'image/png', url: FILE_URL }],
]);

describe('buildRunAgentModelMessageOrThrow', () => {
  it('leaves a message without attachments as a plain string', () => {
    expect(
      buildRunAgentModelMessageOrThrow({
        message: { role: 'assistant', content: 'hi' },
        attachmentsByFileId,
      }),
    ).toEqual({ role: 'assistant', content: 'hi' });
  });

  it('turns an attachment into a file part carrying the stored media type', () => {
    expect(
      buildRunAgentModelMessageOrThrow({
        message: {
          role: 'user',
          content: 'what is in this?',
          attachments: [{ fileId: FILE_ID, filename: 'screenshot.png' }],
        },
        attachmentsByFileId,
      }),
    ).toEqual({
      role: 'user',
      content: [
        { type: 'text', text: 'what is in this?' },
        {
          type: 'file',
          data: FILE_URL,
          mediaType: 'image/png',
          filename: 'screenshot.png',
        },
      ],
    });
  });

  it('omits the text part when an attachment arrives with no caption', () => {
    const message = buildRunAgentModelMessageOrThrow({
      message: {
        role: 'user',
        content: '',
        attachments: [{ fileId: FILE_ID }],
      },
      attachmentsByFileId,
    });

    expect(message.content).toEqual([
      expect.objectContaining({ type: 'file' }),
    ]);
  });

  it('rejects an attachment it cannot resolve rather than answering without it', () => {
    expect(() =>
      buildRunAgentModelMessageOrThrow({
        message: {
          role: 'user',
          content: 'hi',
          attachments: [{ fileId: FILE_ID }],
        },
        attachmentsByFileId: new Map(),
      }),
    ).toThrow(FILE_ID);
  });
});
