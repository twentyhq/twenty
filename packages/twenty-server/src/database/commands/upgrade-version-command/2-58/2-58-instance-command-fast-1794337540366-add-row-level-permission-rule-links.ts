import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.58.0', 1794337540366)
export class AddRowLevelPermissionRuleLinksFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "rowLevelPermissionRuleId" uuid');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD "rowLevelPermissionRuleId" uuid');
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" ADD "rowLevelPermissionRuleId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_RLPP_RULE_ID" ON "core"."rowLevelPermissionPredicate" ("rowLevelPermissionRuleId") ');
    await queryRunner.query('CREATE INDEX "IDX_RLPPG_RULE_ID" ON "core"."rowLevelPermissionPredicateGroup" ("rowLevelPermissionRuleId") ');
    await queryRunner.query('CREATE INDEX "IDX_FIELD_PERMISSION_RULE_ID" ON "core"."fieldPermission" ("rowLevelPermissionRuleId") ');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_b617a57c424cc79e59b6560172d" FOREIGN KEY ("rowLevelPermissionRuleId") REFERENCES "core"."rowLevelPermissionRule"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "FK_fee64b361fd3e8eeee275125d0e" FOREIGN KEY ("rowLevelPermissionRuleId") REFERENCES "core"."rowLevelPermissionRule"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_bd35d2494763b58ce85f13987fb" FOREIGN KEY ("rowLevelPermissionRuleId") REFERENCES "core"."rowLevelPermissionRule"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_bd35d2494763b58ce85f13987fb"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "FK_fee64b361fd3e8eeee275125d0e"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_b617a57c424cc79e59b6560172d"');
    await queryRunner.query('DROP INDEX "core"."IDX_FIELD_PERMISSION_RULE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_RLPPG_RULE_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_RLPP_RULE_ID"');
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" DROP COLUMN "rowLevelPermissionRuleId"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP COLUMN "rowLevelPermissionRuleId"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "rowLevelPermissionRuleId"');
  }
}
