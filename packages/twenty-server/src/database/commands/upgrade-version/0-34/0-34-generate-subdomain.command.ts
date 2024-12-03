import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository, In } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { BaseCommandOptions } from 'src/database/commands/base.command';

// For DX only
type WorkspaceId = string;

type Subdomain = string;

@Command({
  name: 'feat-0.34:add-subdomain-to-workspace',
  description: 'Add a default subdomain to each workspace',
})
export class GenerateDefaultSubdomainCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
  ) {
    super(workspaceRepository);
  }

  private generatePayloadForQuery({
    id,
    subdomain,
    domainName,
    displayName,
  }: Workspace) {
    const result = { id, subdomain };

    if (domainName) {
      const subdomain = domainName.split('.')[0];

      if (subdomain.length > 0) {
        result.subdomain = subdomain;
      }
    }

    if (!domainName && displayName) {
      const displayNameWords = displayName.match(/(\w| |\d)+/);

      if (displayNameWords) {
        result.subdomain = displayNameWords
          .join('-')
          .replace(/ /g, '')
          .toLowerCase();
      }
    }

    return result;
  }

  private groupBySubdomainName(
    acc: Record<Subdomain, Array<WorkspaceId>>,
    workspace: Workspace,
  ) {
    const payload = this.generatePayloadForQuery(workspace);

    acc[payload.subdomain] = acc[payload.subdomain]
      ? acc[payload.subdomain].concat([payload.id])
      : [payload.id];

    return acc;
  }

  private async deduplicateAndSave(
    subdomain: Subdomain,
    workspaceIds: Array<WorkspaceId>,
    options: BaseCommandOptions,
  ) {
    for (const [index, workspaceId] of workspaceIds.entries()) {
      const subdomainDeduplicated =
        index === 0 ? subdomain : `${subdomain}-${index}`;

      this.logger.log(
        `Updating workspace ${workspaceId} with subdomain ${subdomainDeduplicated}`,
      );

      if (!options.dryRun) {
        await this.workspaceRepository.update(workspaceId, {
          subdomain: subdomainDeduplicated,
        });
      }
    }
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: BaseCommandOptions,
    activeWorkspaceIds: string[],
  ): Promise<void> {
    const workspaces = await this.workspaceRepository.find(
      activeWorkspaceIds.length > 0
        ? {
            where: {
              id: In(activeWorkspaceIds),
            },
          }
        : undefined,
    );

    if (workspaces.length === 0) {
      this.logger.log('No workspaces found');

      return;
    }

    const workspaceBySubdomain = Object.entries(
      workspaces.reduce(
        (acc, workspace) => this.groupBySubdomainName(acc, workspace),
        {} as ReturnType<typeof this.groupBySubdomainName>,
      ),
    );

    for (const [subdomain, workspaceIds] of workspaceBySubdomain) {
      await this.deduplicateAndSave(subdomain, workspaceIds, options);
    }
  }
}
