import { type SettingsAiAssistantProfileOperation } from '@/settings/ai/types/SettingsAiAssistantProfileOperation';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const isNameOnlyUpdate = (operation: SettingsAiAssistantProfileOperation) =>
  operation.type === 'update' &&
  isDefined(operation.patch.displayName) &&
  Object.keys(operation.patch).every((field) => field === 'displayName');

export const createSettingsAiAssistantProfileSaveQueue = () => {
  const operations: SettingsAiAssistantProfileOperation[] = [];
  let isProcessing = false;
  let isPaused = false;

  const canProcess = () => !isProcessing && !isPaused;

  const append = (operation: SettingsAiAssistantProfileOperation) => {
    if (isPaused && isNameOnlyUpdate(operation)) {
      const retainedOperations = operations.filter(
        (queuedOperation) => !isNameOnlyUpdate(queuedOperation),
      );

      operations.splice(0, operations.length, ...retainedOperations);
    }

    operations.push(operation);
  };

  const process = async (
    save: (operation: SettingsAiAssistantProfileOperation) => Promise<boolean>,
  ) => {
    if (!canProcess()) {
      return;
    }

    isProcessing = true;

    try {
      while (isNonEmptyArray(operations)) {
        const [operation] = operations;
        const wasSaved = await save(operation);

        if (!wasSaved) {
          isPaused = true;
          return;
        }

        operations.shift();
      }
    } finally {
      isProcessing = false;
    }
  };

  const resume = () => {
    isPaused = false;
  };

  return { append, canProcess, process, resume };
};
