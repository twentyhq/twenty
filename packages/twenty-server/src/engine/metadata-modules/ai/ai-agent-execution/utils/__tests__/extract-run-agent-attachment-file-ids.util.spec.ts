import { type RunAgentMessage } from 'twenty-shared/application';

import { MAX_RUN_AGENT_ATTACHMENT_FILENAME_LENGTH } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/max-run-agent-attachment-filename-length.const';
import { MAX_RUN_AGENT_MESSAGE_ATTACHMENTS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/max-run-agent-message-attachments.const';
import { extractRunAgentAttachmentFileIdsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/extract-run-agent-attachment-file-ids.util';

const FILE_ID = '6fdbd0ba-9a10-4b71-b0b7-2b1d64f8dc27';
const OTHER_FILE_ID = 'c1d3f0a8-8f4e-4a3f-9a7d-0f1d2e3b4c5d';

describe('extractRunAgentAttachmentFileIdsOrThrow', () => {
  it('returns nothing for a conversation that carries no attachment', () => {
    const messages: RunAgentMessage[] = [
      { role: 'user', content: 'hello' },
      { role: 'assistant', content: 'hi' },
    ];

    expect(extractRunAgentAttachmentFileIdsOrThrow(messages)).toEqual([]);
  });

  it('lists each file once when a conversation reuses it', () => {
    const messages: RunAgentMessage[] = [
      { role: 'user', content: 'one', attachments: [{ fileId: FILE_ID }] },
      { role: 'assistant', content: 'ok' },
      {
        role: 'user',
        content: 'two',
        attachments: [{ fileId: FILE_ID }, { fileId: OTHER_FILE_ID }],
      },
    ];

    expect(extractRunAgentAttachmentFileIdsOrThrow(messages)).toEqual([
      FILE_ID,
      OTHER_FILE_ID,
    ]);
  });

  it('rejects attachments on an assistant message', () => {
    const messages: RunAgentMessage[] = [
      {
        role: 'assistant',
        content: 'here you go',
        attachments: [{ fileId: FILE_ID }],
      },
    ];

    expect(() => extractRunAgentAttachmentFileIdsOrThrow(messages)).toThrow(
      'Only user messages can carry attachments',
    );
  });

  it('rejects more attachments than a message may carry', () => {
    const messages: RunAgentMessage[] = [
      {
        role: 'user',
        content: 'hi',
        attachments: Array.from(
          { length: MAX_RUN_AGENT_MESSAGE_ATTACHMENTS + 1 },
          () => ({ fileId: FILE_ID }),
        ),
      },
    ];

    expect(() => extractRunAgentAttachmentFileIdsOrThrow(messages)).toThrow(
      `${MAX_RUN_AGENT_MESSAGE_ATTACHMENTS} allowed`,
    );
  });

  it('rejects a filename longer than the cap', () => {
    const messages: RunAgentMessage[] = [
      {
        role: 'user',
        content: 'hi',
        attachments: [
          {
            fileId: FILE_ID,
            filename: 'a'.repeat(MAX_RUN_AGENT_ATTACHMENT_FILENAME_LENGTH + 1),
          },
        ],
      },
    ];

    expect(() => extractRunAgentAttachmentFileIdsOrThrow(messages)).toThrow(
      `${MAX_RUN_AGENT_ATTACHMENT_FILENAME_LENGTH} characters allowed`,
    );
  });
});
