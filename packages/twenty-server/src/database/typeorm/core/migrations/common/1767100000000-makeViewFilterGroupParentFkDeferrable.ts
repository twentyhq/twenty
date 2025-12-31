import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class MakeViewFilterGroupParentFkDeferrable1767100000000
  implements MigrationInterface
{
  name = 'MakeViewFilterGroupParentFkDeferrable1767100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT IF EXISTS "FK_6aa17342705ae5526de377bf7ed"`,
    );

    // Recreate parentViewFilterGroupId FK as DEFERRABLE INITIALLY DEFERRED
    // Needed because parent/child viewFilterGroups may be inserted in any order
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_6aa17342705ae5526de377bf7ed" FOREIGN KEY ("parentViewFilterGroupId") REFERENCES "core"."viewFilterGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT IF EXISTS "FK_6aa17342705ae5526de377bf7ed"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_6aa17342705ae5526de377bf7ed" FOREIGN KEY ("parentViewFilterGroupId") REFERENCES "core"."viewFilterGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
