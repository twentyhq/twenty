import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateViewsPositionsToDouble1756483901854
  implements MigrationInterface
{
  name = 'UpdateViewsPositionsToDouble1756483901854';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "positionInViewFilterGroup" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "positionInViewFilterGroup" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ALTER COLUMN "position" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "position" TYPE double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "position" TYPE double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "position" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "position" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ALTER COLUMN "position" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "positionInViewFilterGroup" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "positionInViewFilterGroup" TYPE integer`,
    );
  }
}
