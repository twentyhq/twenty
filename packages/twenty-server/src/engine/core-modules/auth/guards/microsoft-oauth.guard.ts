import { type ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class MicrosoftOAuthGuard extends AuthGuard('microsoft') {
  constructor(
    private readonly guardRedirectService: GuardRedirectService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    let workspace: WorkspaceEntity | null = null;

    try {
      if (
        request.query.workspaceId &&
        typeof request.query.workspaceId === 'string'
      ) {
        request.params.workspaceId = request.query.workspaceId;
        workspace = await this.workspaceRepository.findOneBy({
          id: request.query.workspaceId,
        });
      }

      return (await super.canActivate(context)) as boolean;
    } catch (err) {
      this.guardRedirectService.dispatchErrorFromGuard(
        context,
        err,
        this.workspaceDomainsService.getSubdomainAndCustomDomainFromWorkspaceFallbackOnDefaultSubdomain(
          workspace,
        ),
      );

      return false;
    }
  }
}
