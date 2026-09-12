import { sessionGenerationStore } from '@/auth/utils/sessionGenerationStore';

export const getSessionGeneration = (): string | null =>
  sessionGenerationStore.get();
