import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAreLabelAndNameSync1727873087467 implements MigrationInterface {
  name = 'AddAreLabelAndNameSync1727873087467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "areLabelAndNameSync" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "areLabelAndNameSync"`,
    );
  }
}
