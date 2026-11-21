import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// Groups are derived from rules, so the next sync rebuilds them; compact ids keep counting, so stale ids on records never match a new group
export const buildTypedAccessGroupStatements = ({
  schemaName,
}: {
  schemaName: string;
}): string[] => {
  const schema = escapeIdentifier(schemaName);
  const accessGroup = `${schema}."accessGroup"`;

  return [
    `TRUNCATE ${accessGroup}`,
    `ALTER TABLE ${accessGroup} DROP COLUMN "roleId", DROP COLUMN "rowLevelPermissionPredicateGroupId"`,
    `CREATE TYPE ${schema}."accessGroup_type_enum" AS ENUM ('ALL_RECORDS', 'RULE', 'MEMBER_VALUE', 'LITERAL_VALUE')`,
    `ALTER TABLE ${accessGroup}
      ADD COLUMN "type" ${schema}."accessGroup_type_enum" NOT NULL,
      ADD COLUMN "ruleShapeHash" text NOT NULL,
      ADD COLUMN "unreadableFieldIds" uuid[] NOT NULL DEFAULT '{}',
      ADD COLUMN "valuePredicateKey" text,
      ADD COLUMN "value" text,
      ADD CONSTRAINT "CHK_ACCESS_GROUP_TYPE_COLUMNS" CHECK (
        ("type" IN ('ALL_RECORDS', 'RULE') AND "memberFieldValues" IS NULL AND "valuePredicateKey" IS NULL AND "value" IS NULL)
        OR ("type" = 'MEMBER_VALUE' AND "memberFieldValues" IS NOT NULL AND "valuePredicateKey" IS NULL AND "value" IS NULL)
        OR ("type" = 'LITERAL_VALUE' AND "memberFieldValues" IS NULL AND "valuePredicateKey" IS NOT NULL AND "value" IS NOT NULL)
      )`,
    `CREATE INDEX "IDX_ACCESS_GROUP_RULE_SHAPE_MEMBER_FIELD_VALUES" ON ${accessGroup} ("ruleShapeHash", "memberFieldValues") WHERE "type" = 'MEMBER_VALUE'`,
    `CREATE INDEX "IDX_ACCESS_GROUP_RULE_SHAPE_VALUE" ON ${accessGroup} ("ruleShapeHash", "value") WHERE "type" = 'LITERAL_VALUE'`,
  ];
};
