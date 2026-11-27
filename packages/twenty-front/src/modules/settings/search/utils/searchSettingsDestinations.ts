import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { isNonEmptyString } from '@sniptt/guards';
import { normalizeSearchText } from 'twenty-ui/utilities';

const TITLE_WEIGHT = 3;
const BREADCRUMB_WEIGHT = 2;
const KEYWORD_WEIGHT = 1;
const MINIMUM_SUBSTRING_LENGTH = 3;
const MINIMUM_TYPO_TOLERANT_LENGTH = 4;

type WeightedWords = { words: string[]; weight: number };

const splitIntoWords = (texts: string[]) =>
  texts.flatMap((text) =>
    normalizeSearchText(text)
      .split(/[^\p{L}\p{M}\p{N}]+/u)
      .filter(isNonEmptyString),
  );

const isWithinOneEdit = ({
  first,
  second,
}: {
  first: string;
  second: string;
}) => {
  if (Math.abs(first.length - second.length) > 1) {
    return false;
  }

  let firstIndex = 0;
  let secondIndex = 0;
  let editCount = 0;

  while (firstIndex < first.length && secondIndex < second.length) {
    if (first[firstIndex] === second[secondIndex]) {
      firstIndex++;
      secondIndex++;
      continue;
    }

    editCount++;

    if (editCount > 1) {
      return false;
    }

    if (first.length >= second.length) {
      firstIndex++;
    }

    if (first.length <= second.length) {
      secondIndex++;
    }
  }

  return (
    editCount + (first.length - firstIndex) + (second.length - secondIndex) <= 1
  );
};

const getWordMatchQuality = ({
  searchWord,
  word,
}: {
  searchWord: string;
  word: string;
}) => {
  if (word === searchWord) {
    return 4;
  }

  if (word.startsWith(searchWord)) {
    return 3;
  }

  if (
    searchWord.length >= MINIMUM_SUBSTRING_LENGTH &&
    word.includes(searchWord)
  ) {
    return 2;
  }

  const isTypoOfWordStart =
    searchWord.length >= MINIMUM_TYPO_TOLERANT_LENGTH &&
    [-1, 0, 1].some((lengthOffset) =>
      isWithinOneEdit({
        first: searchWord,
        second: word.slice(0, searchWord.length + lengthOffset),
      }),
    );

  return isTypoOfWordStart ? 1 : 0;
};

const getSearchWordScore = ({
  searchWord,
  fields,
}: {
  searchWord: string;
  fields: WeightedWords[];
}) =>
  Math.max(
    0,
    ...fields.flatMap(({ words, weight }) =>
      words.map((word) => getWordMatchQuality({ searchWord, word }) * weight),
    ),
  );

const getDestinationScore = ({
  destination,
  searchWords,
}: {
  destination: SettingsSearchDestination;
  searchWords: string[];
}) => {
  const fields: WeightedWords[] = [
    { words: splitIntoWords([destination.title]), weight: TITLE_WEIGHT },
    {
      words: splitIntoWords(destination.breadcrumbs),
      weight: BREADCRUMB_WEIGHT,
    },
    { words: splitIntoWords(destination.keywords), weight: KEYWORD_WEIGHT },
  ];

  const searchWordScores = searchWords.map((searchWord) =>
    getSearchWordScore({ searchWord, fields }),
  );

  return searchWordScores.includes(0)
    ? 0
    : searchWordScores.reduce((total, score) => total + score, 0);
};

export const searchSettingsDestinations = ({
  destinations,
  search,
}: {
  destinations: SettingsSearchDestination[];
  search: string;
}): SettingsSearchDestination[] => {
  const searchWords = splitIntoWords([search]);

  if (searchWords.length === 0) {
    return [];
  }

  return destinations
    .map((destination) => ({
      destination,
      score: getDestinationScore({ destination, searchWords }),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (first, second) =>
        second.score - first.score ||
        first.destination.breadcrumbs.length -
          second.destination.breadcrumbs.length,
    )
    .map(({ destination }) => destination);
};
