import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteOnRefreshTokenUser1700661180856
  implements MigrationInterface
{
  name = 'AddCascadeDeleteOnRefreshTokenUser1700661180856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" DROP CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" ADD CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" DROP CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."refreshToken" ADD CONSTRAINT "FK_7008a2b0fb083127f60b5f4448e" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
