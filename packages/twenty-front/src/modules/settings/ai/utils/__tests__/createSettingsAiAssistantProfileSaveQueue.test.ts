import { type SettingsAiAssistantProfileOperation } from '@/settings/ai/types/SettingsAiAssistantProfileOperation';
import { createSettingsAiAssistantProfileSaveQueue } from '@/settings/ai/utils/createSettingsAiAssistantProfileSaveQueue';

describe('createSettingsAiAssistantProfileSaveQueue', () => {
  it('saves edits added during a request before the queued reset', async () => {
    const queue = createSettingsAiAssistantProfileSaveQueue();
    const operations: SettingsAiAssistantProfileOperation[] = [];
    const namePatch: SettingsAiAssistantProfileOperation = {
      type: 'update',
      patch: { displayName: 'Nimbus' },
    };
    const avatarPatch: SettingsAiAssistantProfileOperation = {
      type: 'update',
      patch: { isAvatarAnimated: false },
    };
    const concurrentSave = jest.fn(async () => true);

    queue.append(namePatch);

    await queue.process(async (operation) => {
      operations.push(operation);

      if (operation === namePatch) {
        queue.append(avatarPatch);
        queue.append({ type: 'reset' });
        await queue.process(concurrentSave);
      }

      return true;
    });

    expect(operations).toEqual([namePatch, avatarPatch, { type: 'reset' }]);
    expect(concurrentSave).not.toHaveBeenCalled();
    expect(queue.canProcess()).toBe(true);
  });

  it('retains the failed patch and later edits until retry resumes processing', async () => {
    const queue = createSettingsAiAssistantProfileSaveQueue();
    const namePatch: SettingsAiAssistantProfileOperation = {
      type: 'update',
      patch: { displayName: 'Nimbus' },
    };
    const reset: SettingsAiAssistantProfileOperation = { type: 'reset' };
    const failedSave = jest.fn(async () => false);

    queue.append(namePatch);
    queue.append(reset);
    await queue.process(failedSave);
    expect(failedSave).toHaveBeenCalledTimes(1);
    expect(failedSave).toHaveBeenCalledWith(namePatch);
    expect(queue.canProcess()).toBe(false);

    const retry = jest.fn(async () => true);

    await queue.process(retry);
    expect(retry).not.toHaveBeenCalled();

    queue.resume();
    await queue.process(retry);
    expect(retry.mock.calls).toEqual([[namePatch], [reset]]);
    expect(queue.canProcess()).toBe(true);
  });
});
