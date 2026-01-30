import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddNavigationMenuItemViewForeignKey1769196250679
  implements MigrationInterface
{
  name = 'AddNavigationMenuItemViewForeignKey1769196250679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "FK_9ec9d8bc9bb4197be12d4efcaf3" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT "FK_9ec9d8bc9bb4197be12d4efcaf3"`,
    );
  }
}
