import { settingsAiAssistantProfilePersistenceFamilyState } from '@/settings/ai/states/settingsAiAssistantProfilePersistenceFamilyState';
import { type SettingsAiAssistantProfilePersistenceState } from '@/settings/ai/types/SettingsAiAssistantProfilePersistenceState';
import { createSettingsAiAssistantProfileSaveQueue } from '@/settings/ai/utils/createSettingsAiAssistantProfileSaveQueue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useSettingsAiAssistantProfilePersistenceState = (
  workspaceId: string | undefined,
) => {
  const store = useStore();
  const familyKey = workspaceId ?? null;
  const persistenceAtom =
    settingsAiAssistantProfilePersistenceFamilyState.atomFamily(familyKey);
  const settingsAiAssistantProfilePersistence = useAtomFamilyStateValue(
    settingsAiAssistantProfilePersistenceFamilyState,
    familyKey,
  );

  const getPersistenceState =
    (): SettingsAiAssistantProfilePersistenceState => {
      const existingState = store.get(persistenceAtom);

      if (isDefined(existingState)) {
        return existingState;
      }

      const initialState = {
        saveQueue: createSettingsAiAssistantProfileSaveQueue(),
        isSaving: false,
        isRefreshing: false,
        hasRefreshError: false,
      };

      store.set(persistenceAtom, initialState);
      return initialState;
    };

  const updatePersistenceState = ({
    saveQueue,
    patch,
  }: {
    saveQueue: SettingsAiAssistantProfilePersistenceState['saveQueue'];
    patch: Partial<
      Omit<SettingsAiAssistantProfilePersistenceState, 'saveQueue'>
    >;
  }) =>
    store.set(persistenceAtom, (previousState) =>
      previousState?.saveQueue === saveQueue
        ? { ...previousState, ...patch }
        : previousState,
    );

  return {
    isSaving: settingsAiAssistantProfilePersistence?.isSaving ?? false,
    errorMessage: settingsAiAssistantProfilePersistence?.errorMessage,
    isRefreshing: settingsAiAssistantProfilePersistence?.isRefreshing ?? false,
    hasRefreshError:
      settingsAiAssistantProfilePersistence?.hasRefreshError ?? false,
    getSaveQueue: () => getPersistenceState().saveQueue,
    isCurrentSaveQueue: (
      saveQueue: SettingsAiAssistantProfilePersistenceState['saveQueue'],
    ) => store.get(persistenceAtom)?.saveQueue === saveQueue,
    updatePersistenceState,
  };
};
