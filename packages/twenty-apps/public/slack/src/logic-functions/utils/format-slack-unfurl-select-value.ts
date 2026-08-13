import { isNonEmptyString } from '@sniptt/guards';

export const formatSlackUnfurlSelectValue = (
  value: string,
): string | undefined => {
  const words = value.toLowerCase().split('_').filter(isNonEmptyString);

  if (words.length === 0) {
    return undefined;
  }

  const [firstWord, ...remainingWords] = words;

  return [
    firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
    ...remainingWords,
  ].join(' ');
};
