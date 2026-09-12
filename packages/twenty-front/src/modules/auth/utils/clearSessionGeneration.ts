import { sessionGenerationStore } from '@/auth/utils/sessionGenerationStore';

export const clearSessionGeneration = (): void =>
  sessionGenerationStore.clear();
