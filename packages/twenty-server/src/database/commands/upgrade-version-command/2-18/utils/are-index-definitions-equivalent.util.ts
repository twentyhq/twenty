import { isDefined } from 'twenty-shared/utils';

// pg_indexes.indexdef has the shape `CREATE [UNIQUE] INDEX <name> ON <table> ...`;
// two physical indexes are duplicates when everything but the name matches.
export const areIndexDefinitionsEquivalent = ({
  indexDefinitionA,
  indexDefinitionB,
}: {
  indexDefinitionA: string;
  indexDefinitionB: string;
}): boolean => {
  const toComparable = (indexDefinition: string): string | null => {
    const onClauseStart = indexDefinition.indexOf(' ON ');

    if (onClauseStart === -1) {
      return null;
    }

    const isUnique = indexDefinition.startsWith('CREATE UNIQUE INDEX');

    return `${isUnique ? 'UNIQUE' : 'NON_UNIQUE'}${indexDefinition.slice(onClauseStart)}`;
  };

  const comparableA = toComparable(indexDefinitionA);
  const comparableB = toComparable(indexDefinitionB);

  return isDefined(comparableA) && comparableA === comparableB;
};
