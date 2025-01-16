import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameEmailVerifiedColumn1736050161854
  implements MigrationInterface
{
  name = 'RenameEmailVerifiedColumn1736050161854';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" RENAME COLUMN "emailVerified" TO "isEmailVerified"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" RENAME COLUMN "isEmailVerified" TO "emailVerified"`,
    );
  }
}
