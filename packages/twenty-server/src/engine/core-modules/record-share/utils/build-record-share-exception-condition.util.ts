/* @license Enterprise */

import { randomBytes } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// A record of an object open by default carries share rows only when it
// departs from that default: an everyone row below the required level
// restricts it, and a grant naming one of the principals lifts the
// restriction: another everyone row, such as one an application wrote, does not.
// Kept as a single NOT EXISTS so the planner can use an anti-join instead of
// a per-row subplan, which an OR with the grant check would force.
export const buildRecordShareExceptionCondition = ({
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
  const objectMetadataIdParameterName = `recordShareExceptionObjectMetadataId_${parameterSuffix}`;
  const everyonePrincipalIdParameterName = `recordShareExceptionEveryonePrincipalId_${parameterSuffix}`;
  const restrictedAccessLevelsParameterName = `recordShareExceptionRestrictedAccessLevels_${parameterSuffix}`;
  const principalIdsParameterName = `recordShareExceptionPrincipalIds_${parameterSuffix}`;
  const accessLevelsParameterName = `recordShareExceptionAccessLevels_${parameterSuffix}`;

  // Derived from the table alias, these would collide once Postgres
  // truncates a long alias to 63 bytes and the grant would shadow the
  // restriction it must correlate with
  const restrictionAlias = escapeIdentifier(
    `recordShareRestriction_${parameterSuffix}`,
  );
  const grantAlias = escapeIdentifier(`recordShareGrant_${parameterSuffix}`);

  const grantConditions = [
    `${grantAlias}."recordId" = ${restrictionAlias}."recordId"`,
    `${grantAlias}."objectMetadataId" = :${objectMetadataIdParameterName}`,
    `${grantAlias}."principalId" = ANY(:${principalIdsParameterName})`,
    `${grantAlias}."accessLevel" IN (:...${accessLevelsParameterName})`,
    `${grantAlias}."deletedAt" IS NULL`,
  ];

  const restrictionConditions = [
    `${restrictionAlias}."recordId" = ${escapeIdentifier(tableAlias)}."id"`,
    `${restrictionAlias}."objectMetadataId" = :${objectMetadataIdParameterName}`,
    `${restrictionAlias}."principalId" = :${everyonePrincipalIdParameterName}`,
    `${restrictionAlias}."accessLevel" IN (:...${restrictedAccessLevelsParameterName})`,
    `${restrictionAlias}."deletedAt" IS NULL`,
    `NOT EXISTS (SELECT 1 FROM ${recordShareTableExpression} AS ${grantAlias} WHERE ${grantConditions.join(' AND ')})`,
  ];

  return {
    sql: `NOT EXISTS (SELECT 1 FROM ${recordShareTableExpression} AS ${restrictionAlias} WHERE ${restrictionConditions.join(' AND ')})`,
    parameters: {
      [objectMetadataIdParameterName]: objectMetadataId,
      [everyonePrincipalIdParameterName]: EVERYONE_PRINCIPAL_ID,
      [restrictedAccessLevelsParameterName]: Object.values(
        RecordShareAccessLevel,
      ).filter((accessLevel) => !accessLevels.includes(accessLevel)),
      [principalIdsParameterName]: principalIds.filter(
        (principalId) => principalId !== EVERYONE_PRINCIPAL_ID,
      ),
      [accessLevelsParameterName]: accessLevels,
    },
  };
};
