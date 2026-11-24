type SettingsSave<TView> = {
  save: () => Promise<TView>;
  onSaved: (view: TView) => void;
  onFailed: (hasPendingSave: boolean) => Promise<void>;
};

// A save's answer is shown only once no newer save waits: it would undo newer edits
export const createSettingsSaveQueue = <TView>() => {
  let queue: Promise<void> = Promise.resolve();
  let pendingSaveCount = 0;

  return {
    hasPendingSave: (): boolean => pendingSaveCount > 0,
    whenIdle: (): Promise<void> => queue,
    enqueue: ({
      save,
      onSaved,
      onFailed,
    }: SettingsSave<TView>): Promise<void> => {
      pendingSaveCount += 1;
      queue = queue.then(async () => {
        try {
          const view = await save();

          pendingSaveCount -= 1;

          if (pendingSaveCount === 0) {
            onSaved(view);
          }
        } catch {
          pendingSaveCount -= 1;
          await onFailed(pendingSaveCount > 0);
        }
      });

      return queue;
    },
  };
};
