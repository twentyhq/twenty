import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import {
  type RowAccessPolicy,
  type SqlCondition,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { buildRecordShareCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-condition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type InheritedReadabilityParentCondition =
  | {
      kind: 'column';
      joinColumnName: string;
      parentTableAlias: string;
      parentTableExpression: string;
      policy: RowAccessPolicy;
    }
  | {
      kind: 'children';
      childTableAlias: string;
      childTableExpression: string;
      childJoinColumnName: string;
      policy: RowAccessPolicy;
    };

const buildChildLinkBoundCondition = ({
  quotedTableAlias,
  quotedChildTableAlias,
}: {
  quotedTableAlias: string;
  quotedChildTableAlias: string;
}): string =>
  `(${quotedChildTableAlias}."deletedAt" IS NULL OR (${quotedTableAlias}."deletedAt" IS NOT NULL AND ${quotedChildTableAlias}."deletedAt" >= ${quotedTableAlias}."deletedAt"))`;

export const buildInheritedReadabilityCondition = ({
  tableAlias,
  objectMetadataId,
  parents,
  recordShareTableExpression,
  principalIds,
  accessLevels,
}: {
  tableAlias: string;
  objectMetadataId: string;
  parents: InheritedReadabilityParentCondition[];
  recordShareTableExpression: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): SqlCondition => {
  const parameters: ObjectLiteral = {};
  const quotedTableAlias = escapeIdentifier(tableAlias);

  // The share rows on the record itself, its creator's among them, grant
  // access on their own, as they do on a PRIVATE record
  const ownRecordShareCondition = buildRecordShareCondition({
    tableAlias,
    recordShareTableExpression,
    objectMetadataId,
    principalIds,
    accessLevels,
  });

  Object.assign(parameters, ownRecordShareCondition.parameters);

  const parentConditions = parents.flatMap((parent) => {
    if (parent.policy.kind === 'denied') {
      return [];
    }

    if (parent.kind === 'children') {
      const quotedChildTableAlias = escapeIdentifier(parent.childTableAlias);
      const childRowConditions = [
        `${quotedChildTableAlias}.${escapeIdentifier(parent.childJoinColumnName)} = ${quotedTableAlias}."id"`,
        buildChildLinkBoundCondition({
          quotedTableAlias,
          quotedChildTableAlias,
        }),
      ];

      if (parent.policy.kind === 'gated') {
        Object.assign(parameters, parent.policy.condition.parameters);
        childRowConditions.push(parent.policy.condition.sql);
      }

      return [
        `EXISTS (SELECT 1 FROM ${parent.childTableExpression} AS ${quotedChildTableAlias} WHERE ${childRowConditions.join(' AND ')})`,
      ];
    }

    const quotedJoinColumn = `${quotedTableAlias}.${escapeIdentifier(parent.joinColumnName)}`;
    const notNullCondition = `${quotedJoinColumn} IS NOT NULL`;

    if (parent.policy.kind === 'open') {
      return [notNullCondition];
    }

    const quotedParentTableAlias = escapeIdentifier(parent.parentTableAlias);

    Object.assign(parameters, parent.policy.condition.parameters);

    return [
      `(${notNullCondition} AND EXISTS (SELECT 1 FROM ${parent.parentTableExpression} AS ${quotedParentTableAlias} WHERE ${quotedParentTableAlias}."id" = ${quotedJoinColumn} AND ${parent.policy.condition.sql}))`,
    ];
  });

  return {
    sql: `(${[ownRecordShareCondition.sql, ...parentConditions].join(' OR ')})`,
    parameters,
  };
};
