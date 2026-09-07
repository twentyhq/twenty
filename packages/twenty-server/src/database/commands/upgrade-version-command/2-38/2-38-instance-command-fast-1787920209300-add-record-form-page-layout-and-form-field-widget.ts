import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const PAGE_LAYOUT_TYPES_BEFORE =
  "'RECORD_INDEX', 'RECORD_PAGE', 'DASHBOARD', 'STANDALONE_PAGE'";
const PAGE_LAYOUT_TYPES_AFTER = `${PAGE_LAYOUT_TYPES_BEFORE}, 'RECORD_FORM'`;

const WIDGET_TYPES_BEFORE =
  "'VIEW', 'IFRAME', 'FIELD', 'FIELDS', 'GRAPH', 'STANDALONE_RICH_TEXT', 'TIMELINE', 'TASKS', 'NOTES', 'FILES', 'EMAILS', 'CALENDAR', 'FIELD_RICH_TEXT', 'WORKFLOW', 'WORKFLOW_VERSION', 'WORKFLOW_RUN', 'FRONT_COMPONENT', 'RECORD_TABLE', 'EMAIL_THREAD', 'CALL_RECORDING_SUMMARY', 'CALL_RECORDING_TRANSCRIPT', 'MESSAGE_CAMPAIGN_BODY', 'MESSAGE_CAMPAIGN_DETAILS'";
const WIDGET_TYPES_AFTER = `${WIDGET_TYPES_BEFORE}, 'FORM_FIELD'`;

@RegisteredInstanceCommand('2.38.0', 1787920209300)
export class AddRecordFormPageLayoutAndFormFieldWidgetFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.replacePageLayoutTypeEnum(queryRunner, PAGE_LAYOUT_TYPES_AFTER);
    await this.replaceWidgetTypeEnum(queryRunner, WIDGET_TYPES_AFTER);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "core"."pageLayoutWidget" WHERE "type" = 'FORM_FIELD'`,
    );
    await queryRunner.query(
      `DELETE FROM "core"."pageLayout" WHERE "type" = 'RECORD_FORM'`,
    );

    await this.replaceWidgetTypeEnum(queryRunner, WIDGET_TYPES_BEFORE);
    await this.replacePageLayoutTypeEnum(queryRunner, PAGE_LAYOUT_TYPES_BEFORE);
  }

  private async replacePageLayoutTypeEnum(
    queryRunner: QueryRunner,
    enumValues: string,
  ): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "core"."pageLayout_type_enum" RENAME TO "pageLayout_type_enum_old"',
    );
    await queryRunner.query(
      `CREATE TYPE "core"."pageLayout_type_enum" AS ENUM(${enumValues})`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayout" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayout" ALTER COLUMN "type" TYPE "core"."pageLayout_type_enum" USING "type"::"text"::"core"."pageLayout_type_enum"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ALTER COLUMN "type" SET DEFAULT 'RECORD_PAGE'`,
    );
    await queryRunner.query('DROP TYPE "core"."pageLayout_type_enum_old"');
  }

  private async replaceWidgetTypeEnum(
    queryRunner: QueryRunner,
    enumValues: string,
  ): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "core"."pageLayoutWidget_type_enum" RENAME TO "pageLayoutWidget_type_enum_old"',
    );
    await queryRunner.query(
      `CREATE TYPE "core"."pageLayoutWidget_type_enum" AS ENUM(${enumValues})`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" TYPE "core"."pageLayoutWidget_type_enum" USING "type"::"text"::"core"."pageLayoutWidget_type_enum"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ALTER COLUMN "type" SET DEFAULT 'VIEW'`,
    );
    await queryRunner.query('DROP TYPE "core"."pageLayoutWidget_type_enum_old"');
  }
}
