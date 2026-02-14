import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class MakeWorkspaceAndApplicationFileFksDeferrable1770050200000
  implements MigrationInterface
{
  name = 'MakeWorkspaceAndApplicationFileFksDeferrable1770050200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_28f20711184b3c3318a8e44d117"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_3818380258798f9ffa9963b6dc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_3818380258798f9ffa9963b6dc4" FOREIGN KEY ("packageJsonFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_28f20711184b3c3318a8e44d117" FOREIGN KEY ("yarnLockFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_28f20711184b3c3318a8e44d117"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP CONSTRAINT "FK_3818380258798f9ffa9963b6dc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_3818380258798f9ffa9963b6dc4" FOREIGN KEY ("packageJsonFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD CONSTRAINT "FK_28f20711184b3c3318a8e44d117" FOREIGN KEY ("yarnLockFileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "FK_3b1acb13a5dac9956d1a4b32755" FOREIGN KEY ("workspaceCustomApplicationId") REFERENCES "core"."application"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
