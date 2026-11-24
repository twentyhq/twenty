import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { resolveIsInternalImportEnabled } from 'src/engine/core-modules/workspace/utils/resolve-is-internal-import-enabled.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// TODO(@neo773): remove with IS_INTERNAL_IMPORT_COLUMN_ENABLED, callers can then read isInternalImportEnabled from the workspace directly
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

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: [
        'id',
        'isInternalImportEnabled',
        'isInternalMessagesImportEnabled',
      ],
    });

    if (!isDefined(workspace)) {
      return false;
    }

    return resolveIsInternalImportEnabled({
      workspace,
      isInternalImportColumnEnabled,
    });
  }
}
