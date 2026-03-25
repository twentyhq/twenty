import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddConditionalAvailabilityExpressionToCommandMenuItem1772267875870
  implements MigrationInterface
{
  name = 'AddConditionalAvailabilityExpressionToCommandMenuItem1772267875870';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD "conditionalAvailabilityExpression" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP COLUMN "conditionalAvailabilityExpression"`,
    );
  }
}
