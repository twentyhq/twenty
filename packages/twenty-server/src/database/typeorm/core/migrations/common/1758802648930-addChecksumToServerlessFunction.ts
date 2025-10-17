import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddChecksumToServerlessFunction1758802648930
  implements MigrationInterface
{
  name = 'AddChecksumToServerlessFunction1758802648930';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "checksum" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "checksum"`,
    );
  }
}
