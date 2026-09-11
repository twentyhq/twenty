import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789140100000)
export class AddReadabilityParentFieldsToObjectMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ADD "readabilityParentFieldUniversalIdentifiers" uuid array',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN "readabilityParentFieldUniversalIdentifiers"',
    );
  }
}
