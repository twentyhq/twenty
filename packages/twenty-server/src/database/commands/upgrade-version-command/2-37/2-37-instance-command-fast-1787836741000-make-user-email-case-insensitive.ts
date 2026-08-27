import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.37.0', 1787836741000)
export class MakeUserEmailCaseInsensitiveFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS citext');
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM "core"."user"
          WHERE "deletedAt" IS NULL
          GROUP BY lower("email")
          HAVING count(*) > 1
        ) THEN
          RAISE WARNING 'core."user"."email" left case-sensitive: addresses that differ only by casing already exist and must be merged first';
          RETURN;
        END IF;

        DROP INDEX IF EXISTS "core"."UQ_USER_EMAIL";
        ALTER TABLE "core"."user" ALTER COLUMN "email" TYPE citext USING "email"::citext;
        CREATE UNIQUE INDEX "UQ_USER_EMAIL" ON "core"."user" ("email") WHERE "deletedAt" IS NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "core"."UQ_USER_EMAIL"');
    await queryRunner.query(
      'ALTER TABLE "core"."user" ALTER COLUMN "email" TYPE character varying USING "email"::character varying',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_USER_EMAIL" ON "core"."user" ("email") WHERE "deletedAt" IS NULL',
    );
  }
}
