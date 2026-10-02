/* @license Enterprise */

import { randomBytes } from 'node:crypto';

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordShareCondition = ({
  tableAlias,
  recordShareTableExpression,
  objectMetadataId,
  principalIds,
  accessLevels,
  isUncorrelated = false,
}: {
  tableAlias: string;
  recordShareTableExpression: string;
  objectMetadataId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  isUncorrelated?: boolean;
}): { sql: string; parameters: ObjectLiteral } => {
  const parameterSuffix = randomBytes(5).toString('hex');
  const objectMetadataIdParameterName = `recordShareObjectMetadataId_${parameterSuffix}`;
  const principalIdsParameterName = `recordSharePrincipalIds_${parameterSuffix}`;
  const accessLevelsParameterName = `recordShareAccessLevels_${parameterSuffix}`;

  const recordShareAlias = escapeIdentifier(`${tableAlias}_recordShare`);

  const recordId = `${escapeIdentifier(tableAlias)}."id"`;
  const grantConditions = [
    `${recordShareAlias}."objectMetadataId" = :${objectMetadataIdParameterName}`,
    `${recordShareAlias}."principalId" = ANY(:${principalIdsParameterName})`,
    `${recordShareAlias}."accessLevel" IN (:...${accessLevelsParameterName})`,
    `${recordShareAlias}."deletedAt" IS NULL`,
  ];
  const fromRecordShares = `FROM ${recordShareTableExpression} AS ${recordShareAlias}`;

  return {
    // Uncorrelated, Postgres reads the grants once and can OR them with an
    // indexed row filter instead of probing the share table for every row
    sql: isUncorrelated
      ? `${recordId} = ANY(ARRAY(SELECT ${recordShareAlias}."recordId" ${fromRecordShares} WHERE ${grantConditions.join(' AND ')}))`
      : `EXISTS (SELECT 1 ${fromRecordShares} WHERE ${[`${recordShareAlias}."recordId" = ${recordId}`, ...grantConditions].join(' AND ')})`,
    parameters: {
      [objectMetadataIdParameterName]: objectMetadataId,
      [principalIdsParameterName]: principalIds,
      [accessLevelsParameterName]: accessLevels,
    },
  };
};
