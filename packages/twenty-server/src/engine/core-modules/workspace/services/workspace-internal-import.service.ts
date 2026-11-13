import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class WorkspaceInternalImportService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async isInternalImportEnabled({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<boolean> {
    const isInternalImportColumnEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_INTERNAL_IMPORT_COLUMN_ENABLED,
        workspaceId,
      );

    // TODO(@neo773): read isInternalImportEnabled only once the flag is on everywhere
    const propertyName = isInternalImportColumnEnabled
      ? 'isInternalImportEnabled'
      : 'isInternalMessagesImportEnabled';

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: ['id', propertyName],
    });

    return workspace?.[propertyName] ?? false;
  }
}
