import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

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
    `CREATE TYPE ${schema}."accessGroup_type_enum" AS ENUM ('ALL_RECORDS', 'RLS_RULE', 'RLS_MEMBER_VALUE', 'RLS_LITERAL_VALUE')`,
    `ALTER TABLE ${accessGroup}
      ADD COLUMN "type" ${schema}."accessGroup_type_enum" NOT NULL,
      ADD COLUMN "ruleShapeHash" varchar NOT NULL,
      ADD COLUMN "unreadableFieldIds" uuid[] NOT NULL DEFAULT '{}',
      ADD COLUMN "value" varchar,
      ADD CONSTRAINT "CHK_ACCESS_GROUP_TYPE_COLUMNS" CHECK (
        ("type" IN ('ALL_RECORDS', 'RLS_RULE') AND "memberFieldValues" IS NULL AND "value" IS NULL)
        OR ("type" = 'RLS_MEMBER_VALUE' AND "memberFieldValues" IS NOT NULL AND "value" IS NULL)
        OR ("type" = 'RLS_LITERAL_VALUE' AND "memberFieldValues" IS NULL AND "value" IS NOT NULL)
      )`,
    `CREATE INDEX "IDX_ACCESS_GROUP_RULE_SHAPE_MEMBER_FIELD_VALUES" ON ${accessGroup} ("ruleShapeHash", "memberFieldValues") WHERE "type" = 'RLS_MEMBER_VALUE'`,
    `CREATE INDEX "IDX_ACCESS_GROUP_RULE_SHAPE_VALUE" ON ${accessGroup} ("ruleShapeHash", "value") WHERE "type" = 'RLS_LITERAL_VALUE'`,
  ];
};
