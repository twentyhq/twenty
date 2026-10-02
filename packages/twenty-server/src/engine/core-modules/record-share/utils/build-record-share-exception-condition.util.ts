/* @license Enterprise */

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
  nameIndex,
}: {
  tableAlias: string;
  recordShareTableExpression: string;
  objectMetadataId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  nameIndex: number;
}): { sql: string; parameters: ObjectLiteral } => {
  const objectMetadataIdParameterName = `recordShareExceptionObjectMetadataId_${nameIndex}`;
  const everyonePrincipalIdParameterName = `recordShareExceptionEveryonePrincipalId_${nameIndex}`;
  const restrictedAccessLevelsParameterName = `recordShareExceptionRestrictedAccessLevels_${nameIndex}`;
  const principalIdsParameterName = `recordShareExceptionPrincipalIds_${nameIndex}`;
  const accessLevelsParameterName = `recordShareExceptionAccessLevels_${nameIndex}`;

  // Not derived from the table alias, which Postgres truncates to 63 bytes,
  // and led by underscores no object or field name can start with, so the
  // grant cannot shadow the restriction nor either one a statement alias
  const restrictionAlias = escapeIdentifier(
    `__recordShareRestriction_${nameIndex}`,
  );
  const grantAlias = escapeIdentifier(`__recordShareGrant_${nameIndex}`);

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
