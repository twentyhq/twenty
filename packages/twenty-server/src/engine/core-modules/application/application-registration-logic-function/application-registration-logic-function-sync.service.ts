import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Manifest } from 'twenty-shared/application';
import { IsNull, Repository } from 'typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';

@Injectable()
export class ApplicationRegistrationLogicFunctionSyncService {
  constructor(
    @InjectRepository(ApplicationRegistrationLogicFunctionEntity)
    private readonly repository: Repository<ApplicationRegistrationLogicFunctionEntity>,
  ) {}

  async syncFromManifest({
    applicationRegistrationId,
    manifest,
  }: {
    applicationRegistrationId: string;
    manifest: Manifest;
  }): Promise<void> {
    const serverFunctions = (manifest.logicFunctions ?? []).filter(
      (logicFunction) => logicFunction.scope === 'server',
    );

    // Clear `deletedAt` on upsert so re-adding a previously soft-deleted
    // function reactivates the existing row instead of leaving it deleted.
    const rows = serverFunctions.map((logicFunction) => ({
      universalIdentifier: logicFunction.universalIdentifier,
      applicationRegistrationId,
      name: logicFunction.name ?? logicFunction.universalIdentifier,
      serverWebhookTriggerSettings:
        logicFunction.serverWebhookTriggerSettings ?? null,
      serverCronTriggerSettings:
        logicFunction.serverCronTriggerSettings ?? null,
      deletedAt: null,
    }));

    if (rows.length > 0) {
      await this.repository.upsert(rows, [
        'universalIdentifier',
        'applicationRegistrationId',
      ]);
    }

    const keptIdentifiers = new Set(rows.map((row) => row.universalIdentifier));
    const existing = await this.repository.find({
      where: { applicationRegistrationId, deletedAt: IsNull() },
    });
    const idsToSoftDelete = existing
      .filter((row) => !keptIdentifiers.has(row.universalIdentifier))
      .map((row) => row.id);

    if (idsToSoftDelete.length > 0) {
      await this.repository.softDelete(idsToSoftDelete);
    }
  }
}
