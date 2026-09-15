import { v4 as uuidv4 } from 'uuid';

const SESSION_GENERATION_LOCAL_STORAGE_KEY = 'authSessionGeneration';

class SessionGenerationStore {
  private inMemorySessionGeneration: string | null = null;
  private hasUnpersistedSessionGeneration = false;

  get(): string | null {
    if (this.hasUnpersistedSessionGeneration) {
      return this.inMemorySessionGeneration;
    }

    try {
      // Direct reads observe another tab's rotation immediately; persisted Jotai
      // state only reads storage when the atom initializes.
      this.inMemorySessionGeneration = localStorage.getItem(
        SESSION_GENERATION_LOCAL_STORAGE_KEY,
      );
    } catch {}

    return this.inMemorySessionGeneration;
  }

  rotate(): void {
    this.inMemorySessionGeneration = uuidv4();

    try {
      localStorage.setItem(
        SESSION_GENERATION_LOCAL_STORAGE_KEY,
        this.inMemorySessionGeneration,
      );
      this.hasUnpersistedSessionGeneration = false;
    } catch {
      this.hasUnpersistedSessionGeneration = true;
    }
  }

  clear(): void {
    this.inMemorySessionGeneration = null;

    try {
      localStorage.removeItem(SESSION_GENERATION_LOCAL_STORAGE_KEY);
      this.hasUnpersistedSessionGeneration = false;
    } catch {
      this.hasUnpersistedSessionGeneration = true;
    }
  }
}

export const sessionGenerationStore = new SessionGenerationStore();
