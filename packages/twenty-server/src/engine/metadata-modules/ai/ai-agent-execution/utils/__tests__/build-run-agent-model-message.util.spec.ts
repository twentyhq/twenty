import { type ResolvedRunAgentAttachment } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-run-agent-attachment.type';
import { buildRunAgentModelMessageOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-run-agent-model-message.util';

const FILE_ID = '6fdbd0ba-9a10-4b71-b0b7-2b1d64f8dc27';
const FILE_URL = `https://twenty.test/file/agent-chat/${FILE_ID}?token=t`;
const PDF_FILE_ID = 'a2a0d40b-bd5f-4f12-9a0b-06ec8c3f5fd1';
const PDF_FILE_URL = `https://twenty.test/file/agent-chat/${PDF_FILE_ID}?token=t`;

const attachmentsByFileId = new Map<string, ResolvedRunAgentAttachment>([
  [FILE_ID, { mediaType: 'image/png', url: FILE_URL }],
  [PDF_FILE_ID, { mediaType: 'application/pdf', url: PDF_FILE_URL }],
]);

describe('buildRunAgentModelMessageOrThrow', () => {
  it('leaves a message without attachments as a plain string', () => {
    expect(
      buildRunAgentModelMessageOrThrow({
        message: { role: 'assistant', content: 'hi' },
        attachmentsByFileId,
        modalities: ['image'],
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
        modalities: ['image'],
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
      modalities: ['image'],
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
        modalities: ['image'],
      }),
    ).toThrow(FILE_ID);
  });

  it('degrades an attachment the model cannot read into a text part', () => {
    expect(
      buildRunAgentModelMessageOrThrow({
        message: {
          role: 'user',
          content: 'summarize this',
          attachments: [{ fileId: PDF_FILE_ID, filename: 'report.pdf' }],
        },
        attachmentsByFileId,
        modalities: ['image'],
      }),
    ).toEqual({
      role: 'user',
      content: [
        { type: 'text', text: 'summarize this' },
        {
          type: 'text',
          text: '[Attached file: report.pdf (type: application/pdf) — file type is not supported for direct analysis]',
        },
      ],
    });
  });

  it('names an unsupported attachment that carries no filename', () => {
    expect(
      buildRunAgentModelMessageOrThrow({
        message: {
          role: 'user',
          content: '',
          attachments: [{ fileId: PDF_FILE_ID }],
        },
        attachmentsByFileId,
        modalities: ['image'],
      }).content,
    ).toEqual([
      {
        type: 'text',
        text: '[Attached file: uploaded_file (type: application/pdf) — file type is not supported for direct analysis]',
      },
    ]);
  });

  it('keeps the supported attachment and degrades only the unsupported one', () => {
    expect(
      buildRunAgentModelMessageOrThrow({
        message: {
          role: 'user',
          content: 'compare these',
          attachments: [
            { fileId: FILE_ID, filename: 'screenshot.png' },
            { fileId: PDF_FILE_ID, filename: 'report.pdf' },
          ],
        },
        attachmentsByFileId,
        modalities: ['image'],
      }),
    ).toEqual({
      role: 'user',
      content: [
        { type: 'text', text: 'compare these' },
        {
          type: 'file',
          data: FILE_URL,
          mediaType: 'image/png',
          filename: 'screenshot.png',
        },
        {
          type: 'text',
          text: '[Attached file: report.pdf (type: application/pdf) — file type is not supported for direct analysis]',
        },
      ],
    });
  });

  // A model config without modalities claims no file support at all, so every
  // attachment degrades to text instead of risking a provider rejection. The
  // agent still runs, and the text says which file was left out and why.
  it('degrades every attachment when the model declares no modalities', () => {
    expect(
      buildRunAgentModelMessageOrThrow({
        message: {
          role: 'user',
          content: 'what is in this?',
          attachments: [{ fileId: FILE_ID, filename: 'screenshot.png' }],
        },
        attachmentsByFileId,
        modalities: undefined,
      }).content,
    ).toEqual([
      { type: 'text', text: 'what is in this?' },
      {
        type: 'text',
        text: '[Attached file: screenshot.png (type: image/png) — file type is not supported for direct analysis]',
      },
    ]);
  });

  it('labels an attachment stored without a media type as unknown', () => {
    expect(
      buildRunAgentModelMessageOrThrow({
        message: {
          role: 'user',
          content: '',
          attachments: [{ fileId: FILE_ID, filename: 'mystery.bin' }],
        },
        attachmentsByFileId: new Map([
          [FILE_ID, { mediaType: '', url: FILE_URL }],
        ]),
        modalities: ['image'],
      }).content,
    ).toEqual([
      {
        type: 'text',
        text: '[Attached file: mystery.bin (type: unknown) — file type is not supported for direct analysis]',
      },
    ]);
  });
});
