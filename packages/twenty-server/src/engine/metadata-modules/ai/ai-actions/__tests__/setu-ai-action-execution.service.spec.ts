import { SetuAiActionExecutionService } from 'src/engine/metadata-modules/ai/ai-actions/services/setu-ai-action-execution.service';

const EMAIL_PAYLOAD = {
  connectedAccountId: 'account-id',
  senderHandle: 'tim@apple.dev',
  to: ['buyer@example.com'],
  cc: [],
  bcc: [],
  subject: 'Follow-up',
  body: 'Hi,\n\nThanks for the demo.',
};

const buildAction = (overrides: Record<string, unknown> = {}) => ({
  id: 'action-id',
  workspaceId: 'workspace-id',
  initiatorUserWorkspaceId: 'user-workspace-id',
  threadId: null,
  kind: 'send_email',
  payload: EMAIL_PAYLOAD,
  preconditions: {},
  status: 'queued',
  fencingToken: 1,
  expiresAt: new Date(Date.now() + 60_000),
  ...overrides,
});

const build = ({
  queued = buildAction(),
  claimed = buildAction({ status: 'running' }) as ReturnType<
    typeof buildAction
  > | null,
  isFlagEnabled = true,
  actor = {
    workspaceId: 'workspace-id',
    userWorkspaceId: 'user-workspace-id',
    authContext: {},
    rolePermissionConfig: { unionOf: ['role'] },
  } as Record<string, unknown> | null,
  senderAccount = { id: 'account-id' } as Record<string, unknown> | null,
  composeResult = {
    success: true,
    data: { shouldPersistMessage: false },
  } as Record<string, unknown>,
  sendEmail = jest
    .fn()
    .mockResolvedValue({ headerMessageId: '<m@example.com>' }),
} = {}) => {
  const attempt = { id: 'attempt-id' };
  const ledgerService = {
    findById: jest.fn().mockResolvedValue(queued),
    claim: jest.fn().mockResolvedValue(claimed),
    startAttempt: jest.fn().mockResolvedValue(attempt),
    finishAttempt: jest.fn().mockResolvedValue(undefined),
    finishRun: jest.fn().mockResolvedValue(true),
    findStartedAttempt: jest.fn().mockResolvedValue(null),
    resolveAbandonedRun: jest.fn().mockResolvedValue(true),
  };
  const service = new SetuAiActionExecutionService(
    ledgerService as never,
    { resolve: jest.fn().mockResolvedValue(actor) } as never,
    {
      findUsableSenderAccount: jest.fn().mockResolvedValue(senderAccount),
    } as never,
    { isFeatureEnabled: jest.fn().mockResolvedValue(isFlagEnabled) } as never,
    { composeEmail: jest.fn().mockResolvedValue(composeResult) } as never,
    { sendComposedEmail: sendEmail, persistSentMessage: jest.fn() } as never,
    {} as never,
  );

  return { service, ledgerService, sendEmail, attempt };
};

describe('SetuAiActionExecutionService', () => {
  const run = (service: SetuAiActionExecutionService) =>
    service.run({ actionRequestId: 'action-id', leaseOwner: 'worker' });

  it('sends the approved email once and records the provider acceptance', async () => {
    const { service, ledgerService, sendEmail } = build();

    await run(service);

    expect(ledgerService.startAttempt.mock.invocationCallOrder[0]).toBeLessThan(
      sendEmail.mock.invocationCallOrder[0],
    );
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(ledgerService.finishRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'succeeded',
        receipt: expect.objectContaining({
          providerMessageId: '<m@example.com>',
        }),
      }),
    );
  });

  it('does nothing when another worker already claimed the row', async () => {
    const { service, ledgerService, sendEmail } = build({ claimed: null });

    await run(service);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(ledgerService.startAttempt).not.toHaveBeenCalled();
  });

  it('leaves the action queued while the workspace gate is off', async () => {
    const { service, ledgerService } = build({ isFlagEnabled: false });

    await run(service);

    expect(ledgerService.claim).not.toHaveBeenCalled();
  });

  it('blocks without sending when the person lost access', async () => {
    const { service, ledgerService, sendEmail } = build({ actor: null });

    await run(service);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(ledgerService.finishRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'blocked',
        errorCode: 'NOT_AVAILABLE',
      }),
    );
  });

  it('blocks when the sending account is no longer usable', async () => {
    const { service, ledgerService, sendEmail } = build({
      senderAccount: null,
    });

    await run(service);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(ledgerService.finishRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'blocked',
        errorCode: 'ACCOUNT_UNAVAILABLE',
      }),
    );
  });

  it('records an unknown outcome instead of retrying when the send times out', async () => {
    const { service, ledgerService } = build({
      sendEmail: jest.fn().mockRejectedValue(new Error('socket hang up')),
    });

    await run(service);

    expect(ledgerService.finishRun).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'delivery_unknown' }),
    );
    expect(ledgerService.finishAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'ambiguous' }),
    );
  });

  it('fails definitely when the provider refuses for missing permission', async () => {
    const { service, ledgerService } = build({
      sendEmail: jest
        .fn()
        .mockRejectedValue(new Error('Insufficient Permission')),
    });

    await run(service);

    expect(ledgerService.finishRun).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed' }),
    );
  });

  it('expires an approval that outlived its window without sending', async () => {
    const expired = buildAction({
      status: 'running',
      expiresAt: new Date(Date.now() - 1000),
    });
    const { service, ledgerService, sendEmail } = build({ claimed: expired });

    await run(service);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(ledgerService.finishRun).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'expired',
        errorCode: 'APPROVAL_EXPIRED',
      }),
    );
  });

  describe('reconciling a run whose worker vanished', () => {
    it('never resends an email whose attempt had started', async () => {
      const { service, ledgerService, attempt } = build();

      ledgerService.findStartedAttempt.mockResolvedValue(attempt);

      await service.reconcileAbandonedRun(
        buildAction({ status: 'running' }) as never,
      );

      expect(ledgerService.resolveAbandonedRun).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'delivery_unknown' }),
      );
    });

    it('returns an unstarted claim to the queue', async () => {
      const { service, ledgerService } = build();

      await service.reconcileAbandonedRun(
        buildAction({ status: 'running' }) as never,
      );

      expect(ledgerService.resolveAbandonedRun).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'queued' }),
      );
    });
  });
});
