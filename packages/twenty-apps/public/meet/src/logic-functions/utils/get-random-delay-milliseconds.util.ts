import { randomInt } from 'crypto';

export const getRandomDelayMilliseconds = (maximumMilliseconds: number) =>
  randomInt(maximumMilliseconds);
