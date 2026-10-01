/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import { type RecordShareGrant } from 'src/engine/core-modules/record-share/types/record-share-grant.type';
import { resolveRecordIdsRestrictedForPrincipals } from 'src/engine/core-modules/record-share/utils/resolve-record-ids-restricted-for-principals.util';
import { resolveRecordIdsSharedWithPrincipals } from 'src/engine/core-modules/record-share/utils/resolve-record-ids-shared-with-principals.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import {
  type RowAccessExpression,
  type RowAccessPolicy,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';

export type RowAccessRecord = { id: string } & Record<string, unknown>;

type InheritedReadabilityExpression = Extract<
  RowAccessExpression,
  { kind: 'inheritedReadability' }
>;

export type RowAccessEvaluationContext<TRecord extends RowAccessRecord> = {
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  shouldIgnoreSoftDeleteDefaultFilter: boolean;
  fetchRecordShares: (args: {
    objectMetadataId: string;
    recordIds: string[];
  }) => Promise<RecordShareGrant[]>;
  // Parents live in other tables, so whoever holds the records resolves them
  resolveRecordIdsReadableThroughParents: (args: {
    expression: InheritedReadabilityExpression;
    records: TRecord[];
  }) => Promise<Set<string>>;
};

// The in-memory counterpart of compileRowAccessPolicy: both read the same
// policy, so a record admitted by a query is admitted here and vice versa
export const evaluateRowAccessPolicy = async <TRecord extends RowAccessRecord>({
  policy,
  records,
  context,
}: {
  policy: RowAccessPolicy;
  records: TRecord[];
  context: RowAccessEvaluationContext<TRecord>;
}): Promise<Set<string>> => {
  switch (policy.kind) {
    case 'open':
      return new Set(records.map((record) => record.id));
    case 'denied':
      return new Set();
    case 'gated':
      return evaluateRowAccessExpression({
        expression: policy.expression,
        records,
        context,
      });
    default:
      return assertUnreachable(policy);
  }
};

const evaluateRowAccessExpression = async <TRecord extends RowAccessRecord>({
  expression,
  records,
  context,
}: {
  expression: RowAccessExpression;
  records: TRecord[];
  context: RowAccessEvaluationContext<TRecord>;
}): Promise<Set<string>> => {
  if (records.length === 0) {
    return new Set();
  }

  const recordIds = records.map((record) => record.id);

  switch (expression.kind) {
    case 'and': {
      let admittedRecords = records;

      for (const operand of expression.operands) {
        const admittedIds = await evaluateRowAccessExpression({
          expression: operand,
          records: admittedRecords,
          context,
        });

        admittedRecords = admittedRecords.filter((record) =>
          admittedIds.has(record.id),
        );
      }

      return new Set(admittedRecords.map((record) => record.id));
    }
    case 'or': {
      const admittedIds = new Set<string>();

      for (const operand of expression.operands) {
        const remainingRecords = records.filter(
          (record) => !admittedIds.has(record.id),
        );
        const operandAdmittedIds = await evaluateRowAccessExpression({
          expression: operand,
          records: remainingRecords,
          context,
        });

        for (const admittedId of operandAdmittedIds) {
          admittedIds.add(admittedId);
        }
      }

      return admittedIds;
    }
    case 'roleFilter': {
      const matchingRecordIds = records
        .filter((record) =>
          isRecordMatchingRLSRowLevelPermissionPredicate({
            record,
            filter: expression.recordFilter,
            flatObjectMetadata: expression.flatObjectMetadata,
            flatFieldMetadataMaps: context.flatFieldMetadataMaps,
            shouldIgnoreSoftDeleteDefaultFilter:
              context.shouldIgnoreSoftDeleteDefaultFilter,
          }),
        )
        .map((record) => record.id);

      return new Set(matchingRecordIds);
    }
    case 'recordShared':
    case 'namedGrant': {
      const sharedRecordIds = resolveRecordIdsSharedWithPrincipals({
        recordShares: await context.fetchRecordShares({
          objectMetadataId: expression.objectMetadataId,
          recordIds,
        }),
        principalIds: expression.principalIds,
        accessLevels: expression.accessLevels,
      });

      const admittedRecordIds = recordIds.filter((id) =>
        sharedRecordIds.has(id),
      );

      return new Set(admittedRecordIds);
    }
    case 'recordNotRestricted': {
      const restrictedRecordIds = resolveRecordIdsRestrictedForPrincipals({
        recordShares: await context.fetchRecordShares({
          objectMetadataId: expression.objectMetadataId,
          recordIds,
        }),
        principalIds: expression.principalIds,
        accessLevels: expression.accessLevels,
      });

      const admittedRecordIds = recordIds.filter(
        (id) => !restrictedRecordIds.has(id),
      );

      return new Set(admittedRecordIds);
    }
    case 'inheritedReadability': {
      const sharedRecordIds = await evaluateRowAccessExpression({
        expression: {
          kind: 'recordShared',
          tableAlias: expression.tableAlias,
          objectMetadataId: expression.objectMetadataId,
          principalIds: expression.principalIds,
          accessLevels: expression.accessLevels,
        },
        records,
        context,
      });
      const readableThroughParentIds =
        await context.resolveRecordIdsReadableThroughParents({
          expression,
          records: records.filter((record) => !sharedRecordIds.has(record.id)),
        });

      return new Set([...sharedRecordIds, ...readableThroughParentIds]);
    }
    default:
      return assertUnreachable(expression);
  }
};
