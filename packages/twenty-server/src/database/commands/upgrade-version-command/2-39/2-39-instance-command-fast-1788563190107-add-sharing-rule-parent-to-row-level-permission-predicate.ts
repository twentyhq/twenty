/* @license Enterprise */

import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.39.0', 1788563190107)
export class AddSharingRuleParentToRowLevelPermissionPredicateFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicate" ALTER COLUMN "roleId" DROP NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "sharingRuleId" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_RLPP_SHARING_RULE_ID" ON "core"."rowLevelPermissionPredicate" ("sharingRuleId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_5a3434a0f476cf2a4c2b236da98" FOREIGN KEY ("sharingRuleId") REFERENCES "core"."sharingRule"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "CHK_RLPP_ROLE_OR_SHARING_RULE" CHECK (("roleId" IS NULL) <> ("sharingRuleId" IS NULL))',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ALTER COLUMN "roleId" DROP NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD "sharingRuleId" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_RLPPG_SHARING_RULE_ID" ON "core"."rowLevelPermissionPredicateGroup" ("sharingRuleId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "FK_a57c8bed36a04eaf92a70e9d5d6" FOREIGN KEY ("sharingRuleId") REFERENCES "core"."sharingRule"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "CHK_RLPPG_ROLE_OR_SHARING_RULE" CHECK (("roleId" IS NULL) <> ("sharingRuleId" IS NULL))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "CHK_RLPPG_ROLE_OR_SHARING_RULE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "FK_a57c8bed36a04eaf92a70e9d5d6"',
    );
    await queryRunner.query('DROP INDEX "core"."IDX_RLPPG_SHARING_RULE_ID"');
    await queryRunner.query(
      'DELETE FROM "core"."rowLevelPermissionPredicateGroup" WHERE "sharingRuleId" IS NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP COLUMN "sharingRuleId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ALTER COLUMN "roleId" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "CHK_RLPP_ROLE_OR_SHARING_RULE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_5a3434a0f476cf2a4c2b236da98"',
    );
    await queryRunner.query('DROP INDEX "core"."IDX_RLPP_SHARING_RULE_ID"');
    await queryRunner.query(
      'DELETE FROM "core"."rowLevelPermissionPredicate" WHERE "sharingRuleId" IS NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "sharingRuleId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."rowLevelPermissionPredicate" ALTER COLUMN "roleId" SET NOT NULL',
    );
  }
}
