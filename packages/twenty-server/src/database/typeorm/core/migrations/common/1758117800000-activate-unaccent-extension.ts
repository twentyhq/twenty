import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ActivateUnaccentExtension1758117800000
  implements MigrationInterface
{
  name = 'ActivateUnaccentExtension1758117800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);

    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION unaccent_immutable(text) RETURNS text AS $$
        SELECT public.unaccent($1)
      $$ LANGUAGE sql IMMUTABLE;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS unaccent_immutable(text)`);

    // Note: We don't drop the extension as it might be used by other parts
    // Note: We don't drop the extension as it might be used by other parts
    // of the application or other databases. Extensions are typically left in place.
  }
}
