/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { RecordShareAccessLevel } from 'twenty-shared/types';

import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { buildRecordShareExceptionCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-exception-condition.util';

const OBJECT_METADATA_ID = 'object-metadata-1';
const PRINCIPAL_IDS = ['principal-1', EVERYONE_PRINCIPAL_ID];

const build = (accessLevels: RecordShareAccessLevel[], nameIndex = 0) =>
  buildRecordShareExceptionCondition({
    tableAlias: 'company',
    recordShareTableExpression: '"workspace_abc"."recordShare"',
    objectMetadataId: OBJECT_METADATA_ID,
    principalIds: PRINCIPAL_IDS,
    accessLevels,
    nameIndex,
  });

describe('buildRecordShareExceptionCondition', () => {
  it('should render a single NOT EXISTS on restrictions not lifted by a grant', () => {
    const { sql, parameters } = build([
      RecordShareAccessLevel.READ_WRITE,
      RecordShareAccessLevel.FULL,
    ]);

    expect(compileNamedParameters(sql, parameters)).toEqual({
      text: 'NOT EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "__recordShareRestriction_0" WHERE "__recordShareRestriction_0"."recordId" = "company"."id" AND "__recordShareRestriction_0"."objectMetadataId" = $1 AND "__recordShareRestriction_0"."principalId" = $2 AND "__recordShareRestriction_0"."accessLevel" IN ($3, $4) AND "__recordShareRestriction_0"."deletedAt" IS NULL AND NOT EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "__recordShareGrant_0" WHERE "__recordShareGrant_0"."recordId" = "__recordShareRestriction_0"."recordId" AND "__recordShareGrant_0"."objectMetadataId" = $1 AND "__recordShareGrant_0"."principalId" = ANY($5) AND "__recordShareGrant_0"."accessLevel" IN ($6, $7) AND "__recordShareGrant_0"."deletedAt" IS NULL))',
      values: [
        OBJECT_METADATA_ID,
        EVERYONE_PRINCIPAL_ID,
        RecordShareAccessLevel.NONE,
        RecordShareAccessLevel.READ,
        ['principal-1'],
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.FULL,
      ],
    });
  });

  it('should keep its aliases apart whatever the length of the table alias', () => {
    const { sql } = buildRecordShareExceptionCondition({
      tableAlias: 'a'.repeat(80),
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: OBJECT_METADATA_ID,
      principalIds: PRINCIPAL_IDS,
      accessLevels: [RecordShareAccessLevel.FULL],
      nameIndex: 0,
    });

    const aliases = [...sql.matchAll(/ AS "([^"]+)"/g)].map(([, alias]) =>
      Buffer.from(alias).subarray(0, 63).toString(),
    );

    expect(aliases).toHaveLength(2);
    expect(new Set(aliases).size).toBe(2);
  });

  it('should keep its aliases apart from table aliases shaped like them', () => {
    const { sql } = buildRecordShareExceptionCondition({
      tableAlias: 'recordShareRestriction_0',
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: OBJECT_METADATA_ID,
      principalIds: PRINCIPAL_IDS,
      accessLevels: [RecordShareAccessLevel.FULL],
      nameIndex: 0,
    });

    expect(sql).toContain(
      '"__recordShareRestriction_0"."recordId" = "recordShareRestriction_0"."id"',
    );
  });

  it('should only treat levels below the required ones as restrictions', () => {
    const { parameters } = build([
      RecordShareAccessLevel.READ,
      RecordShareAccessLevel.READ_WRITE,
      RecordShareAccessLevel.FULL,
    ]);

    const restrictedAccessLevels = Object.entries(parameters).find(([name]) =>
      name.startsWith('recordShareExceptionRestrictedAccessLevels_'),
    )?.[1];

    expect(restrictedAccessLevels).toEqual([RecordShareAccessLevel.NONE]);
  });

  it('should render the same SQL for the same name index', () => {
    expect(build([RecordShareAccessLevel.FULL], 2)).toEqual(
      build([RecordShareAccessLevel.FULL], 2),
    );
  });

  it('should not reuse parameter names between two name indexes', () => {
    const first = Object.keys(
      build([RecordShareAccessLevel.FULL], 0).parameters,
    );
    const second = Object.keys(
      build([RecordShareAccessLevel.FULL], 1).parameters,
    );

    expect(first.filter((name) => second.includes(name))).toEqual([]);
  });
});
