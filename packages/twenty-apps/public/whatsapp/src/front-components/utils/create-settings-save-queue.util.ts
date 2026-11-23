type SettingsSave<TView> = {
  save: () => Promise<TView>;
  onSaved: (view: TView) => void;
  onFailed: (hasPendingSave: boolean) => Promise<void>;
};

// The answer to a save is only shown once no newer save is waiting: shown
// earlier, it would undo the changes the member made in the meantime
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
