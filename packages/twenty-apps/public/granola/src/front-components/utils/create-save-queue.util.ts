import { isUndefined } from '@sniptt/guards';

type CreateSaveQueueParams<TValue> = {
  saveValue: (value: TValue, isSupersededValue: () => boolean) => Promise<void>;
};

export const createSaveQueue = <TValue>({
  saveValue,
}: CreateSaveQueueParams<TValue>) => {
  let queuedValue: TValue | undefined;
  let isSaving = false;

  const persistQueuedValues = async () => {
    if (isSaving) {
      return;
    }

    isSaving = true;

    try {
      while (!isUndefined(queuedValue)) {
        const valueToSave = queuedValue;

        queuedValue = undefined;

        await saveValue(valueToSave, () => !isUndefined(queuedValue));
      }
    } finally {
      isSaving = false;

      if (!isUndefined(queuedValue)) {
        void persistQueuedValues();
      }
    }
  };

  const enqueueSave = (value: TValue) => {
    queuedValue = value;

    void persistQueuedValues();
  };

  return { enqueueSave };
};
