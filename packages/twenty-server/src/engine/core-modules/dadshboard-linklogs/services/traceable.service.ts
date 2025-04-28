import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import { Repository } from 'typeorm';

import { HandleLinkAccessResult } from 'src/engine/core-modules/dadshboard-linklogs/interfaces/traceable.interface';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { LinkLogsWorkspaceEntity } from 'src/modules/linklogs/standard-objects/linklog.workspace-entity';
import { TraceableWorkspaceEntity } from 'src/modules/traceable/standard-objects/traceable.workspace-entity';

@Injectable()
export class TraceableService {
  private readonly logger = new Logger('TraceableController');

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async handleLinkAccess(input: {
    workspaceId: string;
    traceableId: string;
    userAgent: string;
    userIp: string;
  }): Promise<HandleLinkAccessResult> {
    const { workspaceId, traceableId, userAgent, userIp } = input;

    const traceableRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TraceableWorkspaceEntity>(
        workspaceId,
        'traceable',
      );

    if (!workspaceId) {
      this.logger.error(
        `Missing workspaceId in payload ${JSON.stringify(input)}`,
      );

      return { workspace: null, traceable: null };
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspace)) {
      this.logger.error(`Workspace not fond ${JSON.stringify(input)}`);

      return {
        traceable: null,
        workspace: null,
      };
    }

    const traceable = await traceableRepository.findOneBy({
      id: traceableId,
    });

    if (!isDefined(traceable)) {
      this.logger.error(`Traceable not fond ${JSON.stringify(input)}`);

      return {
        workspace,
        traceable: null,
      };
    }

    const linklogsRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<LinkLogsWorkspaceEntity>(
        workspaceId,
        'linkLogs',
      );

    const traceableAccessLog = linklogsRepository.create({
      userAgent,
      userIp,
      linkId: traceable?.id,
      utmSource: traceable?.campaignSource,
      utmMedium: traceable?.meansOfCommunication,
      utmCampaign: traceable?.campaignName,
      linkName: traceable?.name,
      uv: 1,
    });

    await linklogsRepository.save(traceableAccessLog);

    return {
      workspace,
      traceable,
    };
  }
}
