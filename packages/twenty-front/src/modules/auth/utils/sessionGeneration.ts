import { v4 as generateUuid } from 'uuid';

const SESSION_GENERATION_LOCAL_STORAGE_KEY = 'authSessionGeneration';

export const getSessionGeneration = (): string | null => {
  try {
    return localStorage.getItem(SESSION_GENERATION_LOCAL_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const rotateSessionGeneration = (): void => {
  try {
    localStorage.setItem(SESSION_GENERATION_LOCAL_STORAGE_KEY, generateUuid());
  } catch {
    return;
  }
};

export const clearSessionGeneration = (): void => {
  try {
    localStorage.removeItem(SESSION_GENERATION_LOCAL_STORAGE_KEY);
  } catch {
    return;
  }
};
