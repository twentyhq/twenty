/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { buildRecordShareCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-condition.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

const OBJECT_METADATA_ID = 'object-metadata-1';
const PRINCIPAL_IDS = ['principal-1', 'principal-2'];
const ACCESS_LEVELS = [
  RecordShareAccessLevel.READ_WRITE,
  RecordShareAccessLevel.FULL,
];

const build = (nameIndex = 0) =>
  buildRecordShareCondition({
    tableAlias: 'company',
    recordShareTableExpression: '"workspace_abc"."recordShare"',
    objectMetadataId: OBJECT_METADATA_ID,
    principalIds: PRINCIPAL_IDS,
    accessLevels: ACCESS_LEVELS,
    nameIndex,
  });

describe('buildRecordShareCondition', () => {
  it('should render a correlated EXISTS on the record share table', () => {
    expect(build()).toEqual({
      sql: 'EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "__recordShare_0" WHERE "__recordShare_0"."recordId" = "company"."id" AND "__recordShare_0"."objectMetadataId" = :recordShareObjectMetadataId_0 AND "__recordShare_0"."principalId" = ANY(:recordSharePrincipalIds_0) AND "__recordShare_0"."accessLevel" IN (:...recordShareAccessLevels_0) AND "__recordShare_0"."deletedAt" IS NULL)',
      parameters: {
        recordShareObjectMetadataId_0: OBJECT_METADATA_ID,
        recordSharePrincipalIds_0: PRINCIPAL_IDS,
        recordShareAccessLevels_0: ACCESS_LEVELS,
      },
    });
  });

  it('should compile to positional parameters with the access levels spread', () => {
    const { sql, parameters } = build();

    expect(compileNamedParameters(sql, parameters)).toEqual({
      text: 'EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "__recordShare_0" WHERE "__recordShare_0"."recordId" = "company"."id" AND "__recordShare_0"."objectMetadataId" = $1 AND "__recordShare_0"."principalId" = ANY($2) AND "__recordShare_0"."accessLevel" IN ($3, $4) AND "__recordShare_0"."deletedAt" IS NULL)',
      values: [
        OBJECT_METADATA_ID,
        PRINCIPAL_IDS,
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.FULL,
      ],
    });
  });

  it('should render the same SQL for the same name index', () => {
    expect(build(3)).toEqual(build(3));
  });

  it('should use distinct parameter names and alias for distinct name indexes', () => {
    const first = build(0);
    const second = build(1);

    expect(
      Object.keys(first.parameters).filter(
        (parameterName) => parameterName in second.parameters,
      ),
    ).toEqual([]);
    expect(second.sql).toContain('AS "__recordShare_1"');
  });

  it('should escape the table alias and keep the share alias apart from a long one', () => {
    const longTableAlias = `per"son${'a'.repeat(80)}`;
    const { sql } = buildRecordShareCondition({
      tableAlias: longTableAlias,
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: OBJECT_METADATA_ID,
      principalIds: PRINCIPAL_IDS,
      accessLevels: ACCESS_LEVELS,
      nameIndex: 0,
    });

    expect(sql).toContain('AS "__recordShare_0"');
    expect(sql).toContain(`= "per""son${'a'.repeat(80)}"."id"`);
  });

  it('should keep the share alias apart from a table alias shaped like it', () => {
    const { sql } = buildRecordShareCondition({
      tableAlias: 'recordShare_0',
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: OBJECT_METADATA_ID,
      principalIds: PRINCIPAL_IDS,
      accessLevels: ACCESS_LEVELS,
      nameIndex: 0,
    });

    expect(sql).toContain(
      '"__recordShare_0"."recordId" = "recordShare_0"."id"',
    );
  });

  it('should match the record id against the grants read once when uncorrelated', () => {
    const { sql, parameters } = buildRecordShareCondition({
      tableAlias: 'company',
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: OBJECT_METADATA_ID,
      principalIds: ['principal-1'],
      accessLevels: [RecordShareAccessLevel.READ, RecordShareAccessLevel.FULL],
      isUncorrelated: true,
      nameIndex: 0,
    });

    expect(compileNamedParameters(sql, parameters)).toEqual({
      text: '"company"."id" = ANY(ARRAY(SELECT "__recordShare_0"."recordId" FROM "workspace_abc"."recordShare" AS "__recordShare_0" WHERE "__recordShare_0"."objectMetadataId" = $1 AND "__recordShare_0"."principalId" = ANY($2) AND "__recordShare_0"."accessLevel" IN ($3, $4) AND "__recordShare_0"."deletedAt" IS NULL))',
      values: [
        OBJECT_METADATA_ID,
        ['principal-1'],
        RecordShareAccessLevel.READ,
        RecordShareAccessLevel.FULL,
      ],
    });
  });
});
