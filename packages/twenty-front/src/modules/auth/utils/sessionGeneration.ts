import { v4 as uuidv4 } from 'uuid';

const SESSION_GENERATION_LOCAL_STORAGE_KEY = 'authSessionGeneration';
let inMemorySessionGeneration: string | null = null;

export const getSessionGeneration = (): string | null => {
  try {
    // Direct reads observe another tab's rotation immediately; persisted Jotai
    // state only reads storage when the atom initializes.
    inMemorySessionGeneration = localStorage.getItem(
      SESSION_GENERATION_LOCAL_STORAGE_KEY,
    );
  } catch {}

  return inMemorySessionGeneration;
};

export const rotateSessionGeneration = (): void => {
  inMemorySessionGeneration = uuidv4();

  try {
    localStorage.setItem(
      SESSION_GENERATION_LOCAL_STORAGE_KEY,
      inMemorySessionGeneration,
    );
  } catch {}
};

export const clearSessionGeneration = (): void => {
  inMemorySessionGeneration = null;

  try {
    localStorage.removeItem(SESSION_GENERATION_LOCAL_STORAGE_KEY);
  } catch {}
};
