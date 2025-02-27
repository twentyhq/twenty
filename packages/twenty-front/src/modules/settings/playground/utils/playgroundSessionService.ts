import { PlaygroundSessionKeys } from '@/settings/playground/types/SessionKeys';

export const PlaygroundSessionService = {
  get: <T = string>(key: PlaygroundSessionKeys): T | null =>
    sessionStorage.getItem(PlaygroundSessionKeys[key]) as T | null,

  set: <T = string>(key: PlaygroundSessionKeys, value: T): void =>
    sessionStorage.setItem(PlaygroundSessionKeys[key], String(value)),

  clear: (key: keyof typeof PlaygroundSessionKeys): void =>
    sessionStorage.removeItem(PlaygroundSessionKeys[key]),
};
