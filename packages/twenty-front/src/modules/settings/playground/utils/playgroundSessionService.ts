import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';

/**
 * Service to manage playground session data in sessionStorage
 */
export const PlaygroundSessionService = {
  get: <T>(key: PlaygroundSessionKeys): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error getting playground session data', error);
      return null;
    }
  },
  set: <T>(key: PlaygroundSessionKeys, value: T): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting playground session data', error);
    }
  },
  clear: (): void => {
    try {
      Object.values(PlaygroundSessionKeys).forEach((key) => {
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing playground session data', error);
    }
  },
};
