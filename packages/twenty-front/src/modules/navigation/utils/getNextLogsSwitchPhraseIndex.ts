import { isDefined } from 'twenty-shared/utils';

export const getNextLogsSwitchPhraseIndex = ({
  phraseCount,
  previousPhraseIndex,
}: {
  phraseCount: number;
  previousPhraseIndex: number | null;
}) => {
  if (!isDefined(previousPhraseIndex) || phraseCount < 2) {
    return Math.floor(Math.random() * phraseCount);
  }

  const offset = 1 + Math.floor(Math.random() * (phraseCount - 1));

  return (previousPhraseIndex + offset) % phraseCount;
};
