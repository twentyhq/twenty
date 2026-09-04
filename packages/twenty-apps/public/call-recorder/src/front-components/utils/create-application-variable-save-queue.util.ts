import { isUndefined } from '@sniptt/guards';

type CreateApplicationVariableSaveQueueParams = {
  saveValue: (value: string) => Promise<void>;
};

export const createApplicationVariableSaveQueue = ({
  saveValue,
}: CreateApplicationVariableSaveQueueParams) => {
  let queuedValue: string | undefined;
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

        await saveValue(valueToSave);
      }
    } finally {
      isSaving = false;

      if (!isUndefined(queuedValue)) {
        void persistQueuedValues();
      }
    }
  };

  const enqueueSave = (value: string) => {
    queuedValue = value;

    void persistQueuedValues();
  };

  return { enqueueSave };
};
