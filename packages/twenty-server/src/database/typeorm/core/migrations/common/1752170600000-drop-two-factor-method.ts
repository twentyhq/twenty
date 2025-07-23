import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOldTwoFactorMethodTable1752170600000
  implements MigrationInterface
{
  name = 'DropOldTwoFactorMethodTable1752170600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorMethod" DROP CONSTRAINT "FK_c1044145be65a4ee65c07e0a658"`,
    );
    await queryRunner.query(`DROP TABLE "core"."twoFactorMethod"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."twoFactorMethod" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userWorkspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_752f0250dd6824289ceddd8b054" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorMethod" ADD CONSTRAINT "FK_c1044145be65a4ee65c07e0a658" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
