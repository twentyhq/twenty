/* @license Enterprise */

import { randomBytes } from 'node:crypto';

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Uncorrelated, so Postgres reads the grants once and can OR them with an
// indexed row filter instead of probing the share table for every row
export const buildRecordIdsSharedWithPrincipalsCondition = ({
  tableAlias,
  recordShareTableExpression,
  objectMetadataId,
  principalIds,
  accessLevels,
}: {
  tableAlias: string;
  recordShareTableExpression: string;
  objectMetadataId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): { sql: string; parameters: ObjectLiteral } => {
  const parameterSuffix = randomBytes(5).toString('hex');
  const objectMetadataIdParameterName = `namedGrantObjectMetadataId_${parameterSuffix}`;
  const principalIdsParameterName = `namedGrantPrincipalIds_${parameterSuffix}`;
  const accessLevelsParameterName = `namedGrantAccessLevels_${parameterSuffix}`;

  const recordShareAlias = escapeIdentifier(`${tableAlias}_namedGrant`);

  const conditions = [
    `${recordShareAlias}."objectMetadataId" = :${objectMetadataIdParameterName}`,
    `${recordShareAlias}."principalId" = ANY(:${principalIdsParameterName})`,
    `${recordShareAlias}."accessLevel" IN (:...${accessLevelsParameterName})`,
    `${recordShareAlias}."deletedAt" IS NULL`,
  ];

  return {
    sql: `${escapeIdentifier(tableAlias)}."id" = ANY(ARRAY(SELECT ${recordShareAlias}."recordId" FROM ${recordShareTableExpression} AS ${recordShareAlias} WHERE ${conditions.join(' AND ')}))`,
    parameters: {
      [objectMetadataIdParameterName]: objectMetadataId,
      [principalIdsParameterName]: principalIds,
      [accessLevelsParameterName]: accessLevels,
    },
  };
};
