import { type ReadableRelationWithArguments } from '@/object-record/graphql/types/ReadableRelationWithArguments';
import { getRelationWithArgumentsVariableNames } from '@/object-record/graphql/utils/getRelationWithArgumentsVariableNames';

export const getRelationsWithArgumentsVariables = (
  readableRelationsWithArguments: ReadableRelationWithArguments[],
) =>
  Object.fromEntries(
    readableRelationsWithArguments.flatMap(
      ({ responseKey, relationWithArguments: { filter, orderBy, first } }) => {
        const variableNames =
          getRelationWithArgumentsVariableNames(responseKey);

        return [
          [variableNames.filter, filter],
          [variableNames.orderBy, orderBy],
          [variableNames.first, first],
        ];
      },
    ),
  );
