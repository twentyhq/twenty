import { type ReadableRelationWithArguments } from '@/object-record/graphql/types/ReadableRelationWithArguments';
import { doNotTranslate } from 'twenty-shared/i18n';

export const getRelationsWithArgumentsVariables = (
  readableRelationsWithArguments: ReadableRelationWithArguments[],
) =>
  Object.fromEntries(
    readableRelationsWithArguments.flatMap(
      ({ responseKey, relationWithArguments: { filter, orderBy, first } }) => [
        [doNotTranslate(`${responseKey}Filter`), filter],
        [doNotTranslate(`${responseKey}OrderBy`), orderBy],
        [doNotTranslate(`${responseKey}First`), first],
      ],
    ),
  );
