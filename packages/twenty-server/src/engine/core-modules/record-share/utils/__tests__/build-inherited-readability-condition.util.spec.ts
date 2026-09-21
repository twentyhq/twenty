/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import {
  buildInheritedReadabilityCondition,
  type InheritedReadabilityParentCondition,
} from 'src/engine/core-modules/record-share/utils/build-inherited-readability-condition.util';

const RECORD_SHARE_TABLE_EXPRESSION = '"workspace_abc"."recordShare"';
const ATTACHMENT_OBJECT_METADATA_ID = 'attachment-object-metadata-id';
const PRINCIPAL_IDS = ['principal-1', 'principal-2'];
const ACCESS_LEVELS = [RecordShareAccessLevel.READ];

const OWN_RECORD_SHARE_EXISTS =
  '(EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "attachment_recordShare" WHERE "attachment_recordShare"."recordId" = "attachment"."id"';

const countOccurrences = (haystack: string, needle: string): number =>
  haystack.split(needle).length - 1;

const build = (parents: InheritedReadabilityParentCondition[]) =>
  buildInheritedReadabilityCondition({
    tableAlias: 'attachment',
    objectMetadataId: ATTACHMENT_OBJECT_METADATA_ID,
    parents,
    recordShareTableExpression: RECORD_SHARE_TABLE_EXPRESSION,
    principalIds: PRINCIPAL_IDS,
    accessLevels: ACCESS_LEVELS,
  });

const noteParent = (
  policy: InheritedReadabilityParentCondition['policy'],
): InheritedReadabilityParentCondition => ({
  kind: 'column',
  joinColumnName: 'targetNoteId',
  parentTableAlias: 'attachment_targetNoteId',
  parentTableExpression: '"workspace_abc"."note"',
  policy,
});

const personParent = (
  policy: InheritedReadabilityParentCondition['policy'],
): InheritedReadabilityParentCondition => ({
  kind: 'column',
  joinColumnName: 'targetPersonId',
  parentTableAlias: 'attachment_targetPersonId',
  parentTableExpression: '"workspace_abc"."person"',
  policy,
});

describe('buildInheritedReadabilityCondition', () => {
  it('should accept a share row on the record itself or an OPEN parent present', () => {
    const { sql, parameters } = build([
      personParent({ kind: 'open' }),
      {
        kind: 'column',
        joinColumnName: 'targetCompanyId',
        parentTableAlias: 'attachment_targetCompanyId',
        parentTableExpression: '"workspace_abc"."company"',
        policy: { kind: 'open' },
      },
    ]);

    expect(sql.startsWith(OWN_RECORD_SHARE_EXISTS)).toBe(true);
    expect(sql).toContain(
      ' OR "attachment"."targetPersonId" IS NOT NULL OR "attachment"."targetCompanyId" IS NOT NULL)',
    );
    expect(countOccurrences(sql, 'EXISTS')).toBe(1);
    expect(
      Object.entries(parameters)
        .filter(([name]) => name.startsWith('recordShareObjectMetadataId_'))
        .map(([, value]) => value),
    ).toEqual([ATTACHMENT_OBJECT_METADATA_ID]);
  });

  it('should correlate a gated parent through the parent row under its policy', () => {
    const { sql, parameters } = build([
      personParent({ kind: 'open' }),
      noteParent({
        kind: 'gated',
        condition: {
          sql: '"attachment_targetNoteId"."companyId" IS NOT NULL',
          parameters: { nested: 'value' },
        },
      }),
    ]);

    expect(sql).toContain(
      ' OR "attachment"."targetPersonId" IS NOT NULL OR ("attachment"."targetNoteId" IS NOT NULL AND EXISTS (SELECT 1 FROM "workspace_abc"."note" AS "attachment_targetNoteId" WHERE "attachment_targetNoteId"."id" = "attachment"."targetNoteId" AND "attachment_targetNoteId"."companyId" IS NOT NULL)))',
    );
    expect(countOccurrences(sql, 'EXISTS')).toBe(2);
    expect(sql).not.toContain('"attachment"."targetPersonId" IS NOT NULL AND');
    expect(parameters.nested).toBe('value');
  });

  it('should only keep rows shared directly when every parent is denied', () => {
    const { sql } = build([noteParent({ kind: 'denied' })]);

    expect(sql.startsWith(OWN_RECORD_SHARE_EXISTS)).toBe(true);
    expect(sql).not.toContain('IS NOT NULL');
    expect(countOccurrences(sql, 'EXISTS')).toBe(1);
  });

  it('should accept a live child row, or one trashed with the record, of an OPEN child object', () => {
    const { sql } = build([
      {
        kind: 'children',
        childTableAlias: 'attachment_noteTarget',
        childTableExpression: '"workspace_abc"."noteTarget"',
        childJoinColumnName: 'noteId',
        policy: { kind: 'open' },
      },
    ]);

    expect(sql).toContain(
      ' OR EXISTS (SELECT 1 FROM "workspace_abc"."noteTarget" AS "attachment_noteTarget" WHERE "attachment_noteTarget"."noteId" = "attachment"."id" AND ("attachment_noteTarget"."deletedAt" IS NULL OR ("attachment"."deletedAt" IS NOT NULL AND "attachment_noteTarget"."deletedAt" >= "attachment"."deletedAt"))))',
    );
  });

  it('should require a readable child row of a gated child object and skip a denied one', () => {
    const { sql, parameters } = build([
      {
        kind: 'children',
        childTableAlias: 'attachment_noteTarget',
        childTableExpression: '"workspace_abc"."noteTarget"',
        childJoinColumnName: 'noteId',
        policy: {
          kind: 'gated',
          condition: {
            sql: '"attachment_noteTarget"."targetPersonId" IS NOT NULL',
            parameters: { nested: 'value' },
          },
        },
      },
      {
        kind: 'children',
        childTableAlias: 'attachment_secret',
        childTableExpression: '"workspace_abc"."secret"',
        childJoinColumnName: 'attachmentId',
        policy: { kind: 'denied' },
      },
    ]);

    expect(sql).toContain(
      ' OR EXISTS (SELECT 1 FROM "workspace_abc"."noteTarget" AS "attachment_noteTarget" WHERE "attachment_noteTarget"."noteId" = "attachment"."id" AND ("attachment_noteTarget"."deletedAt" IS NULL OR ("attachment"."deletedAt" IS NOT NULL AND "attachment_noteTarget"."deletedAt" >= "attachment"."deletedAt")) AND "attachment_noteTarget"."targetPersonId" IS NOT NULL))',
    );
    expect(sql).not.toContain('secret');
    expect(parameters.nested).toBe('value');
  });
});
