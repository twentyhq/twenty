import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { EmailComposerService } from 'src/engine/core-modules/tool/tools/email-tool/email-composer.service';
import { type EmailToolInput } from 'src/engine/core-modules/tool/tools/email-tool/types/email-tool-input.type';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';

const GMAIL_COMPOSE_SCOPE = 'https://www.googleapis.com/auth/gmail.compose';

const buildComposedEmail = (connectedAccount: {
  id: string;
  provider: ConnectedAccountProvider;
  scopes: string[] | null;
}) => ({
  recipients: { to: ['test@example.com'], cc: [], bcc: [] },
  toRecipientsDisplay: 'test@example.com',
  sanitizedSubject: 'Subject',
  plainTextBody: 'body',
  sanitizedHtmlBody: '<p>body</p>',
  attachments: [],
  connectedAccount,
  shouldPersistMessage: true,
});

const baseInput: EmailToolInput = {
  recipients: { to: 'test@example.com', cc: '', bcc: '' },
  subject: 'Subject',
  body: '<p>body</p>',
  files: [],
};

describe('DraftEmailTool', () => {
  let tool: DraftEmailTool;
  let mockComposeEmail: jest.Mock;
  let mockCreateDraft: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockComposeEmail = jest.fn();
    mockCreateDraft = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DraftEmailTool,
        {
          provide: EmailComposerService,
          useValue: { composeEmail: mockComposeEmail },
        },
        {
          provide: MessagingMessageOutboundService,
          useValue: { createDraft: mockCreateDraft },
        },
      ],
    }).compile();

    tool = module.get(DraftEmailTool);
  });

  it('fails without drafting when the resolved account lacks the compose scope', async () => {
    mockComposeEmail.mockResolvedValue({
      success: true,
      data: buildComposedEmail({
        id: 'account-1',
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [],
      }),
    });

    const result = await tool.execute(baseInput, { workspaceId: 'workspace-1' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('insufficient permissions');
    expect(mockCreateDraft).not.toHaveBeenCalled();
  });

  it('creates the draft when the resolved account has the compose scope', async () => {
    mockComposeEmail.mockResolvedValue({
      success: true,
      data: buildComposedEmail({
        id: 'account-1',
        provider: ConnectedAccountProvider.GOOGLE,
        scopes: [GMAIL_COMPOSE_SCOPE],
      }),
    });

    const result = await tool.execute(baseInput, { workspaceId: 'workspace-1' });

    expect(result.success).toBe(true);
    expect(mockCreateDraft).toHaveBeenCalledTimes(1);
  });
});
