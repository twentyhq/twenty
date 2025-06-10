import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateServerlessFunctionDefaultRuntimeToNode221749205425841
  implements MigrationInterface
{
  name = 'UpdateServerlessFunctionDefaultRuntimeToNode221749205425841';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update the default value for the runtime column to nodejs22.x
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ALTER COLUMN "runtime" SET DEFAULT 'nodejs22.x'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the default value back to nodejs18.x
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ALTER COLUMN "runtime" SET DEFAULT 'nodejs18.x'`,
    );
  }
}
