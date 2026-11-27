import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { getEditDistance } from 'twenty-shared/workflow';
import { normalizeSearchText } from 'twenty-ui/utilities';

const TITLE_WEIGHT = 3;
const BREADCRUMB_WEIGHT = 2;
const KEYWORD_WEIGHT = 1;
const EXACT_MATCH_QUALITY = 4;
const PREFIX_MATCH_QUALITY = 3;
const SUBSTRING_MATCH_QUALITY = 2;
const TYPO_MATCH_QUALITY = 1;
const MINIMUM_TYPO_TOLERANT_LENGTH = 5;

type WeightedWords = { words: string[]; weight: number };

const splitIntoWords = (texts: string[]) =>
  texts.flatMap((text) =>
    normalizeSearchText(text)
      .split(/[^\p{L}\p{M}\p{N}]+/u)
      .filter(isNonEmptyString),
  );

const getWordMatchQuality = ({
  searchWord,
  word,
}: {
  searchWord: string;
  word: string;
}) => {
  if (word === searchWord) {
    return EXACT_MATCH_QUALITY;
  }

  if (word.startsWith(searchWord)) {
    return PREFIX_MATCH_QUALITY;
  }

  if (word.includes(searchWord)) {
    return SUBSTRING_MATCH_QUALITY;
  }

  const isTypoOfWordStart =
    searchWord.length >= MINIMUM_TYPO_TOLERANT_LENGTH &&
    [-1, 0, 1].some(
      (lengthOffset) =>
        getEditDistance(
          searchWord,
          word.slice(0, searchWord.length + lengthOffset),
        ) <= 1,
    );

  return isTypoOfWordStart ? TYPO_MATCH_QUALITY : 0;
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
  destination: Pick<
    SettingsSearchDestination,
    'title' | 'breadcrumbs' | 'keywords'
  >;
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

  if (!isNonEmptyArray(searchWords)) {
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
