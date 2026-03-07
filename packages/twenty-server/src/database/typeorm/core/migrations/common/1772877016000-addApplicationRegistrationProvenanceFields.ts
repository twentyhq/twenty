import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddApplicationRegistrationProvenanceFields1772877016000
  implements MigrationInterface
{
  name = 'AddApplicationRegistrationProvenanceFields1772877016000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD COLUMN "provenanceRepositoryUrl" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD COLUMN "isProvenanceVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD COLUMN "provenanceVerifiedAt" timestamptz`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "provenanceVerifiedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "isProvenanceVerified"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "provenanceRepositoryUrl"`,
    );
  }
}
