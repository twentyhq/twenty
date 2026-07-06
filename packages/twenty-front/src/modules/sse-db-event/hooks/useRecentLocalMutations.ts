import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { recentLocalMutationsState } from '@/sse-db-event/states/recentLocalMutationsState';

const MUTATION_EXPIRATION_MS = 10000;

export const useRecentLocalMutations = () => {
  const [recentLocalMutations, setRecentLocalMutations] = useAtomState(
    recentLocalMutationsState,
  );

  const registerMutation = (objectNameSingular: string, recordId: string) => {
    const key = `${objectNameSingular}:${recordId}`;
    const now = Date.now();
    setRecentLocalMutations((prev) => {
      const copy = { ...prev, [key]: now };
      for (const k in copy) {
        if (now - copy[k] >= MUTATION_EXPIRATION_MS) {
          delete copy[k];
        }
      }
      return copy;
    });
  };

  const unregisterMutation = (objectNameSingular: string, recordId: string) => {
    const key = `${objectNameSingular}:${recordId}`;
    setRecentLocalMutations((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const isRecentMutation = (objectNameSingular: string, recordId: string) => {
    const key = `${objectNameSingular}:${recordId}`;
    const timestamp = recentLocalMutations[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < MUTATION_EXPIRATION_MS;
  };

  return {
    registerMutation,
    unregisterMutation,
    isRecentMutation,
  };
};
export type UseRecentLocalMutations = typeof useRecentLocalMutations;
