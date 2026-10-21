import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1792526732371)
export class AddAccessTokenExpiresAtToConnectedAccountFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" timestamptz',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" DROP COLUMN IF EXISTS "accessTokenExpiresAt"',
    );
  }
}
