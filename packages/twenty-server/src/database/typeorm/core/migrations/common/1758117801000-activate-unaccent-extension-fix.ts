import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ActivateUnaccentExtensionFix1758117801000
  implements MigrationInterface
{
  name = 'ActivateUnaccentExtensionFix1758117801000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;`,
    );

    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION public.unaccent_immutable(input text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
AS $$
SELECT public.unaccent('public.unaccent'::regdictionary, input)
$$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.unaccent_immutable(text)`,
    );
    // Note: We don't drop the extension as it might be used elsewhere
  }
}
