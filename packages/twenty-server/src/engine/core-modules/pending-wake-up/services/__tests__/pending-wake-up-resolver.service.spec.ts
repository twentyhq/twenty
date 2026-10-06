import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { type PendingWakeUpBeforeClaimDecision } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';

const WORKSPACE_ID = 'workspace-id';
const WAKE_UP_ID = 'wake-up-id';

const EVENT = {
  eventName: 'company.updated',
  recordId: 'company-id',
  record: { id: 'company-id', name: 'Acme' },
};

const STORED_WAKE_UP = {
  id: WAKE_UP_ID,
  workspaceId: WORKSPACE_ID,
  ownerType: 'WORKFLOW_STEP',
  ownerId: 'owner-id',
  ownerKey: 'owner-key',
  condition: { type: 'EVENT', eventName: 'company.updated' },
};

const buildService = ({
  storedWakeUp = STORED_WAKE_UP,
  claimedWakeUp = storedWakeUp,
  decision = { type: 'RESOLVE', context: 'context' },
}: {
  storedWakeUp?: object | null;
  claimedWakeUp?: object | null;
  decision?: PendingWakeUpBeforeClaimDecision<string>;
} = {}) => {
  const pendingWakeUpService = {
    find: jest.fn().mockResolvedValue(storedWakeUp),
    claim: jest.fn().mockResolvedValue(claimedWakeUp),
    scheduleResolution: jest.fn(),
  };
  const handler = {
    ownerType: 'WORKFLOW_STEP' as const,
    buildResumeJobOptions: jest.fn(),
    beforeClaim: jest.fn().mockResolvedValue(decision),
    resolve: jest.fn(),
  };
  const registry = new PendingWakeUpOwnerHandlerRegistryService();

  registry.register(handler);

  const service = new PendingWakeUpResolverService(
    pendingWakeUpService as never,
    registry,
  );

  return { service, pendingWakeUpService, handler };
};

describe('PendingWakeUpResolverService', () => {
  it('does nothing when the wake-up was already resolved or cancelled', async () => {
    const { service, handler } = buildService({ storedWakeUp: null });

    await service.resolve({ workspaceId: WORKSPACE_ID, wakeUpId: WAKE_UP_ID });

    expect(handler.beforeClaim).not.toHaveBeenCalled();
    expect(handler.resolve).not.toHaveBeenCalled();
  });

  it('claims the wake-up and hands the event to its owner', async () => {
    const { service, pendingWakeUpService, handler } = buildService();

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAKE_UP_ID,
      event: EVENT,
    });

    expect(pendingWakeUpService.claim).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAKE_UP_ID,
    });
    expect(handler.resolve).toHaveBeenCalledWith({
      claimedWakeUp: STORED_WAKE_UP,
      outcome: { type: 'EVENT_RECEIVED', event: EVENT },
      context: 'context',
    });
  });

  it('hands over the event as the owner restricted it', async () => {
    const restrictedEvent = { ...EVENT, record: { id: 'company-id' } };
    const { service, handler } = buildService({
      decision: { type: 'RESOLVE', event: restrictedEvent, context: 'context' },
    });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAKE_UP_ID,
      event: EVENT,
    });

    expect(handler.resolve).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: { type: 'EVENT_RECEIVED', event: restrictedEvent },
      }),
    );
  });

  it('reports an expiry when an event wake-up resolves without an event', async () => {
    const { service, handler } = buildService();

    await service.resolve({ workspaceId: WORKSPACE_ID, wakeUpId: WAKE_UP_ID });

    expect(handler.resolve).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: { type: 'EXPIRED' } }),
    );
  });

  it('starts the attempt counters at zero for the owner', async () => {
    const { service, handler } = buildService();

    await service.resolve({ workspaceId: WORKSPACE_ID, wakeUpId: WAKE_UP_ID });

    expect(handler.beforeClaim).toHaveBeenCalledWith({
      wakeUp: STORED_WAKE_UP,
      event: undefined,
      attempt: 0,
      recordReadAttempt: 0,
    });
  });

  it('puts the resolution off with the counters the owner asks for', async () => {
    const { service, pendingWakeUpService, handler } = buildService({
      decision: { type: 'RETRY_LATER', delayMs: 4_000, recordReadAttempt: 2 },
    });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAKE_UP_ID,
      event: EVENT,
      attempt: 3,
      recordReadAttempt: 1,
    });

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
    expect(handler.resolve).not.toHaveBeenCalled();
    expect(pendingWakeUpService.scheduleResolution).toHaveBeenCalledWith({
      wakeUp: STORED_WAKE_UP,
      event: EVENT,
      attempt: undefined,
      recordReadAttempt: 2,
      delayMs: 4_000,
    });
  });

  it('leaves the wake-up pending when its owner ignores the event', async () => {
    const { service, pendingWakeUpService, handler } = buildService({
      decision: { type: 'IGNORE' },
    });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAKE_UP_ID,
      event: EVENT,
    });

    expect(pendingWakeUpService.claim).not.toHaveBeenCalled();
    expect(pendingWakeUpService.scheduleResolution).not.toHaveBeenCalled();
    expect(handler.resolve).not.toHaveBeenCalled();
  });

  it('does not resolve a wake-up another resolution claimed first', async () => {
    const { service, handler } = buildService({ claimedWakeUp: null });

    await service.resolve({
      workspaceId: WORKSPACE_ID,
      wakeUpId: WAKE_UP_ID,
      event: EVENT,
    });

    expect(handler.resolve).not.toHaveBeenCalled();
  });
});
