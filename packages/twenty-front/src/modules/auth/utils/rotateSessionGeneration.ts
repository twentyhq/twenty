import { sessionGenerationStore } from '@/auth/utils/sessionGenerationStore';

export const rotateSessionGeneration = (): void =>
  sessionGenerationStore.rotate();
