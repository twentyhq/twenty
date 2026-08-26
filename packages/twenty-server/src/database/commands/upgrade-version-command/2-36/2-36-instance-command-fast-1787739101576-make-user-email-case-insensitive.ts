import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.36.0', 1787739101576)
export class MakeUserEmailCaseInsensitiveFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.assertNoAddressesDifferingOnlyByCase(queryRunner);

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS citext');
    await queryRunner.query('DROP INDEX IF EXISTS "core"."UQ_USER_EMAIL"');
    await queryRunner.query(
      'ALTER TABLE "core"."user" ALTER COLUMN "email" TYPE citext USING "email"::citext',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_USER_EMAIL" ON "core"."user" ("email") WHERE "deletedAt" IS NULL',
    );
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

  private async assertNoAddressesDifferingOnlyByCase(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const collidingAddresses: { email: string }[] = await queryRunner.query(
      `SELECT lower("email") AS email
       FROM "core"."user"
       WHERE "deletedAt" IS NULL
       GROUP BY lower("email")
       HAVING count(*) > 1`,
    );

    if (collidingAddresses.length > 0) {
      throw new Error(
        `Cannot make core."user"."email" case-insensitive while these addresses exist more than once with different casing: ${collidingAddresses
          .map(({ email }) => email)
          .join(', ')}. Merge or soft-delete the duplicate users, then re-run the upgrade.`,
      );
    }
  }
}
