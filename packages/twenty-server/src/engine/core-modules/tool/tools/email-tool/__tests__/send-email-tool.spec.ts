import { Test, type TestingModule } from '@nestjs/testing';

import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { type EmailToolInput } from 'src/engine/core-modules/tool/tools/email-tool/types/email-tool-input.type';
import { SendEmailService } from 'src/modules/messaging/message-outbound-manager/services/send-email.service';

const buildComposedEmail = (shouldPersistMessage: boolean) => ({
  recipients: { to: ['test@example.com'], cc: [], bcc: [] },
  toRecipientsDisplay: 'test@example.com',
  sanitizedSubject: 'Subject',
  plainTextBody: 'body',
  sanitizedHtmlBody: '<p>body</p>',
  attachments: [],
  connectedAccount: { id: 'account-1' },
  messageChannelId: 'channel-1',
  shouldPersistMessage,
});

const sendResult = {
  headerMessageId: '<sent-message@mail.example.com>',
  messageExternalId: 'provider-message-id',
  threadExternalId: 'provider-thread-id',
};

const baseInput: EmailToolInput = {
  recipients: { to: 'test@example.com', cc: '', bcc: '' },
  subject: 'Subject',
  body: '<p>body</p>',
  files: [],
};

describe('SendEmailTool', () => {
  let tool: SendEmailTool;
  let mockComposeEmail: jest.Mock;
  let mockSendComposedEmail: jest.Mock;
  let mockPersistSentMessage: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockComposeEmail = jest.fn();
    mockSendComposedEmail = jest.fn().mockResolvedValue(sendResult);
    mockPersistSentMessage = jest.fn().mockResolvedValue({
      messageId: 'message-record-id',
      messageThreadId: 'message-thread-record-id',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendEmailTool,
        {
          provide: EmailComposerService,
          useValue: { composeEmail: mockComposeEmail },
        },
        {
          provide: SendEmailService,
          useValue: {
            sendComposedEmail: mockSendComposedEmail,
            persistSentMessage: mockPersistSentMessage,
          },
        },
      ],
    }).compile();

    tool = module.get(SendEmailTool);
  });

  it('returns the sent message identifiers when the message is persisted', async () => {
    mockComposeEmail.mockResolvedValue({
      success: true,
      data: buildComposedEmail(true),
    });

    const result = await tool.execute(baseInput, {
      workspaceId: 'workspace-1',
    });

    expect(result.success).toBe(true);
    expect(result.result).toMatchObject({
      headerMessageId: '<sent-message@mail.example.com>',
      threadExternalId: 'provider-thread-id',
      messageId: 'message-record-id',
      messageThreadId: 'message-thread-record-id',
    });
  });

  it('returns the send identifiers without record ids when persistence is disabled', async () => {
    mockComposeEmail.mockResolvedValue({
      success: true,
      data: buildComposedEmail(false),
    });

    const result = await tool.execute(baseInput, {
      workspaceId: 'workspace-1',
    });

    expect(mockPersistSentMessage).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.result).toMatchObject({
      headerMessageId: '<sent-message@mail.example.com>',
      threadExternalId: 'provider-thread-id',
      messageId: undefined,
      messageThreadId: undefined,
    });
  });

  it('still succeeds without record ids when persistence fails', async () => {
    mockComposeEmail.mockResolvedValue({
      success: true,
      data: buildComposedEmail(true),
    });
    mockPersistSentMessage.mockResolvedValue(undefined);

    const result = await tool.execute(baseInput, {
      workspaceId: 'workspace-1',
    });

    expect(result.success).toBe(true);
    expect(result.result).toMatchObject({
      headerMessageId: '<sent-message@mail.example.com>',
      messageId: undefined,
      messageThreadId: undefined,
    });
  });
});
