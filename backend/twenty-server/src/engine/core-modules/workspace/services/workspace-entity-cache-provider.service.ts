import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CoreEntityCache } from 'src/engine/core-entity-cache/decorators/core-entity-cache.decorator';
import { CoreEntityCacheProvider } from 'src/engine/core-entity-cache/interfaces/core-entity-cache-provider.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
@CoreEntityCache('workspaceEntity')
export class WorkspaceEntityCacheProviderService extends CoreEntityCacheProvider<FlatWorkspace> {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {
    super();
  }

  async computeForCache(entityId: string): Promise<FlatWorkspace | null> {
    const entity = await this.workspaceRepository.findOneBy({ id: entityId });

    if (entity === null) {
      return null;
    }

    return fromWorkspaceEntityToFlat(entity);
  }
}
