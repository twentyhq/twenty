import type { RelationReference } from '../types/mapped-source-record.type';
import type { TwentyClientLike } from '../types/twenty-client-like.type';
import { findExistingTwentyRecord } from './find-existing-twenty-record';

export type RelationResolutionResult =
  | {
      ok: true;
      relationFieldValues: Record<string, string>;
      missingOptionalRelations: RelationReference[];
    }
  | {
      ok: false;
      code: 'MISSING_REQUIRED_RELATION';
      message: string;
      retryable: true;
      missingRelation: RelationReference;
    };

export const resolveXopureRelations = async (params: {
  client: TwentyClientLike;
  relations: RelationReference[];
}): Promise<RelationResolutionResult> => {
  const relationFieldValues: Record<string, string> = {};
  const missingOptionalRelations: RelationReference[] = [];

  for (const relation of params.relations) {
    const existing = await findExistingTwentyRecord({
      client: params.client,
      targetObject: relation.targetObject,
      externalIdField: relation.externalIdField,
      externalIdValue: relation.externalIdValue,
    });

    if (existing) {
      relationFieldValues[relation.relationIdFieldName] = existing.id;
      continue;
    }

    if (relation.required) {
      return {
        ok: false,
        code: 'MISSING_REQUIRED_RELATION',
        message: `Required ${relation.targetObject} relation ${relation.externalIdValue} is missing for ${relation.fieldName}.`,
        retryable: true,
        missingRelation: relation,
      };
    }

    missingOptionalRelations.push(relation);
  }

  return {
    ok: true,
    relationFieldValues,
    missingOptionalRelations,
  };
};
