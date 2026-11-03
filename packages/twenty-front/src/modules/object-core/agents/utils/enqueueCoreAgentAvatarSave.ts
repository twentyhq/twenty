const SAVE_QUEUES_BY_SCOPE = new WeakMap<object, Map<string, Promise<void>>>();

export const enqueueCoreAgentAvatarSave = ({
  scope,
  agentId,
  save,
}: {
  scope: object;
  agentId: string;
  save: () => Promise<void>;
}): Promise<void> => {
  const queues =
    SAVE_QUEUES_BY_SCOPE.get(scope) ?? new Map<string, Promise<void>>();

  SAVE_QUEUES_BY_SCOPE.set(scope, queues);

  const previous = queues.get(agentId) ?? Promise.resolve();
  const next = previous.then(save, save);

  queues.set(agentId, next);

  const releaseQueue = () => {
    if (queues.get(agentId) === next) {
      queues.delete(agentId);
    }

    if (queues.size === 0) {
      SAVE_QUEUES_BY_SCOPE.delete(scope);
    }
  };

  void next.then(releaseQueue, releaseQueue);

  return next;
};
