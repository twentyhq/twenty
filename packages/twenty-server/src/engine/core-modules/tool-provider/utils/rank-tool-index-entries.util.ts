import { isNonEmptyString } from '@sniptt/guards';
import { camelToSnakeCase, isDefined } from 'twenty-shared/utils';

import { TOOL_SEARCH_STOPWORDS } from 'src/engine/core-modules/tool-provider/constants/tool-search-stopwords.const';
import { TOOL_SEARCH_VERB_SYNONYMS } from 'src/engine/core-modules/tool-provider/constants/tool-search-verb-synonyms.const';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';

const NAME_EXACT_MATCH_SCORE = 3;
const NAME_LOOSE_MATCH_SCORE = 2;
const DESCRIPTION_MATCH_SCORE = 1;
const ALL_QUERY_TOKENS_MATCHED_BONUS = 2;
const OBJECT_NAME_COVERED_BONUS = 2;
const MIN_PREFIX_MATCH_LENGTH = 3;

type SearchableToolEntry = {
  nameTokens: Set<string>;
  looseNameTokens: string[];
  objectNameTokens: string[];
  descriptionTokens: Set<string>;
};

// Folds regular English plurals so "companies" and "company" compare equal.
// Irregular plurals (people/person) are covered by object aliases instead.
const singularizeToken = (token: string): string => {
  if (token.length <= 3) {
    return token;
  }

  if (token.endsWith('ies')) {
    return `${token.slice(0, -3)}y`;
  }

  if (/(ss|us|x|ch|sh)es$/.test(token)) {
    return token.slice(0, -2);
  }

  if (token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('us')) {
    return token.slice(0, -1);
  }

  return token;
};

const splitIntoTokens = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(
      (token) => isNonEmptyString(token) && !TOOL_SEARCH_STOPWORDS.has(token),
    );

const splitIntoSingularTokens = (text: string): string[] =>
  splitIntoTokens(text).map(singularizeToken);

// Each query token matches either itself or the operation token its verb
// stands for.
const buildQueryTokenVariants = (query: string): Set<string>[] =>
  [...new Set(splitIntoTokens(query))].map((token) => {
    const synonym = TOOL_SEARCH_VERB_SYNONYMS[token];

    return new Set([token, ...(isDefined(synonym) ? [synonym] : [])]);
  });

const getObjectNameForm = (entry: ToolIndexEntry): string | undefined => {
  if (
    !isDefined(entry.objectName) ||
    !isDefined(entry.operation) ||
    !entry.name.startsWith(`${entry.operation}_`)
  ) {
    return undefined;
  }

  return entry.name.slice(entry.operation.length + 1);
};

// CRUD names embed the singular or plural object name depending on the
// operation. Collecting every form used for an object lets find_one_person
// answer "people" without looking up object metadata.
const buildObjectAliasTokensByObjectName = (
  entries: ToolIndexEntry[],
): Map<string, Set<string>> => {
  const aliasTokensByObjectName = new Map<string, Set<string>>();

  for (const entry of entries) {
    if (!isDefined(entry.objectName)) {
      continue;
    }

    const aliasTokens =
      aliasTokensByObjectName.get(entry.objectName) ??
      new Set(splitIntoSingularTokens(camelToSnakeCase(entry.objectName)));

    const objectNameForm = getObjectNameForm(entry);

    if (isDefined(objectNameForm)) {
      for (const token of splitIntoSingularTokens(objectNameForm)) {
        aliasTokens.add(token);
      }
    }

    aliasTokensByObjectName.set(entry.objectName, aliasTokens);
  }

  return aliasTokensByObjectName;
};

// Exact name tokens outrank a match that only holds after plural folding or
// through the object's other grammatical number, so "create task" prefers
// create_one_task and "create tasks" prefers create_many_tasks.
const scoreQueryTokenVariants = (
  variants: Set<string>,
  searchableEntry: SearchableToolEntry,
): number => {
  let bestScore = 0;

  for (const variant of variants) {
    if (searchableEntry.nameTokens.has(variant)) {
      return NAME_EXACT_MATCH_SCORE;
    }

    const singularVariant = singularizeToken(variant);

    const isLooseNameMatch = searchableEntry.looseNameTokens.some(
      (token) =>
        token === singularVariant ||
        (variant.length >= MIN_PREFIX_MATCH_LENGTH &&
          token.startsWith(singularVariant)),
    );

    if (isLooseNameMatch) {
      bestScore = Math.max(bestScore, NAME_LOOSE_MATCH_SCORE);
    } else if (searchableEntry.descriptionTokens.has(singularVariant)) {
      bestScore = Math.max(bestScore, DESCRIPTION_MATCH_SCORE);
    }
  }

  return bestScore;
};

const isTokenCoveredByQuery = (
  token: string,
  queryTokenVariants: Set<string>[],
): boolean => {
  const singularToken = singularizeToken(token);

  return queryTokenVariants.some((variants) =>
    [...variants].some((variant) => {
      const singularVariant = singularizeToken(variant);

      return (
        singularVariant === singularToken ||
        (variant.length >= MIN_PREFIX_MATCH_LENGTH &&
          singularToken.startsWith(singularVariant))
      );
    }),
  );
};

// Without this, "create task" ties create_one_task with
// create_many_task_targets, since both names contain "create" and "task".
const isObjectNameCoveredByQuery = (
  objectNameTokens: string[],
  queryTokenVariants: Set<string>[],
): boolean =>
  objectNameTokens.length > 0 &&
  objectNameTokens.every((token) =>
    isTokenCoveredByQuery(token, queryTokenVariants),
  );

export const rankToolIndexEntries = ({
  entries,
  query,
  limit,
}: {
  entries: ToolIndexEntry[];
  query: string;
  limit: number;
}): { matches: ToolIndexEntry[]; totalMatches: number } => {
  const queryTokenVariants = buildQueryTokenVariants(query);

  if (queryTokenVariants.length === 0) {
    return { matches: [], totalMatches: 0 };
  }

  const aliasTokensByObjectName = buildObjectAliasTokensByObjectName(entries);

  const scoredEntries = entries
    .map((entry) => {
      const objectAliasTokens = isDefined(entry.objectName)
        ? (aliasTokensByObjectName.get(entry.objectName) ?? new Set<string>())
        : new Set<string>();

      const searchableEntry: SearchableToolEntry = {
        nameTokens: new Set(splitIntoTokens(entry.name)),
        looseNameTokens: [
          ...new Set([
            ...splitIntoSingularTokens(entry.name),
            ...objectAliasTokens,
          ]),
        ],
        objectNameTokens: splitIntoTokens(getObjectNameForm(entry) ?? ''),
        descriptionTokens: new Set(splitIntoSingularTokens(entry.description)),
      };

      const tokenScores = queryTokenVariants.map((variants) =>
        scoreQueryTokenVariants(variants, searchableEntry),
      );

      const score = tokenScores.reduce(
        (sum, tokenScore) => sum + tokenScore,
        0,
      );

      const allQueryTokensMatched = tokenScores.every(
        (tokenScore) => tokenScore > 0,
      );

      if (score === 0) {
        return { entry, score };
      }

      return {
        entry,
        score:
          score +
          (allQueryTokensMatched ? ALL_QUERY_TOKENS_MATCHED_BONUS : 0) +
          (isObjectNameCoveredByQuery(
            searchableEntry.objectNameTokens,
            queryTokenVariants,
          )
            ? OBJECT_NAME_COVERED_BONUS
            : 0),
      };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.entry.name.localeCompare(right.entry.name),
    );

  return {
    matches: scoredEntries.slice(0, limit).map(({ entry }) => entry),
    totalMatches: scoredEntries.length,
  };
};
