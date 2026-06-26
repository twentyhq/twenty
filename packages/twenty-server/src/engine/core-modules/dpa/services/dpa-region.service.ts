import { Injectable } from '@nestjs/common';

import { DEFAULT_DPA_REGION } from 'src/engine/core-modules/dpa/config/dpa-region-config.constant';
import { type DpaRegion } from 'src/engine/core-modules/dpa/types/dpa.types';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// Single choke point for resolving the deployment region. Today the region is a
// deployment-wide setting (data residency is determined by where the instance is
// hosted; twenty.com cloud is EU-only for now), so it comes from config. The
// per-workspace argument is kept in the signature so this can later become a
// per-workspace override without changing any caller (resolver, signup hook).
@Injectable()
export class DpaRegionService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getRegionForWorkspace(_workspace?: Pick<WorkspaceEntity, 'id'>): DpaRegion {
    return this.getDeploymentRegion();
  }

  getDeploymentRegion(): DpaRegion {
    const configured = this.twentyConfigService.get('DPA_DEPLOYMENT_REGION');

    return configured ?? DEFAULT_DPA_REGION;
  }
}
