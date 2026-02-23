import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Command({
  name: 'workspace:sync-agent-workspace-members',
  description:
    'Link Agent records to Workspace Members by matching email addresses.',
})
export class SyncAgentWorkspaceMembersCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected override readonly logger = new Logger(
    SyncAgentWorkspaceMembersCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    let agentObjectMetadata = await this.objectMetadataRepository.findOne({
      where: { nameSingular: 'agent', workspaceId, isActive: true },
    });

    if (!agentObjectMetadata) {
      agentObjectMetadata = await this.objectMetadataRepository.findOne({
        where: { nameSingular: 'agentProfile', workspaceId, isActive: true },
      });
    }

    if (!agentObjectMetadata) {
      this.logger.log(
        `No active Agent object found in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workspaceMemberObjectMetadata =
      await this.objectMetadataRepository.findOne({
        where: {
          nameSingular: 'workspaceMember',
          workspaceId,
          isActive: true,
        },
      });

    if (!workspaceMemberObjectMetadata) return;

    const workspaceMemberRelationField =
      await this.fieldMetadataRepository.findOne({
        where: {
          objectMetadataId: agentObjectMetadata.id,
          type: FieldMetadataType.RELATION,
          relationTargetObjectMetadataId: workspaceMemberObjectMetadata.id,
          workspaceId,
          isActive: true,
        },
      });

    if (!workspaceMemberRelationField) {
      this.logger.log(
        `No WorkspaceMember relation field found on Agent in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const foreignKeyColumn = `${workspaceMemberRelationField.name}Id`;

    const agentRepository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      agentObjectMetadata.nameSingular,
      { shouldBypassPermissionChecks: true },
    );

    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    const unlinkedAgents = await agentRepository
      .createQueryBuilder('agent')
      .where(`agent."${foreignKeyColumn}" IS NULL`)
      .andWhere('agent."deletedAt" IS NULL')
      .getMany();

    if (unlinkedAgents.length === 0) {
      this.logger.log(`No unlinked agents found in workspace ${workspaceId}`);

      return;
    }

    const workspaceMembers = await workspaceMemberRepository.find();

    const workspaceMemberByEmail = new Map<
      string,
      WorkspaceMemberWorkspaceEntity
    >();

    for (const member of workspaceMembers) {
      if (isDefined(member.userEmail)) {
        workspaceMemberByEmail.set(member.userEmail.toLowerCase(), member);
      }
    }

    let linkedCount = 0;

    for (const agent of unlinkedAgents) {
      const agentRecord = agent as Record<string, unknown>;
      const emails = agentRecord.emails as
        | { primaryEmail?: string }
        | undefined;
      const primaryEmail = emails?.primaryEmail;

      if (!primaryEmail) continue;

      const matchingMember = workspaceMemberByEmail.get(
        primaryEmail.toLowerCase(),
      );

      if (!matchingMember) continue;

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would link agent "${agentRecord.name ?? agentRecord.id}" to workspace member "${matchingMember.userEmail}"`,
        );
      } else {
        await agentRepository.update(
          { id: agentRecord.id as string },
          { [foreignKeyColumn]: matchingMember.id },
        );

        this.logger.log(
          `Linked agent "${agentRecord.name ?? agentRecord.id}" to workspace member "${matchingMember.userEmail}"`,
        );
      }

      linkedCount++;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Linked ${linkedCount}/${unlinkedAgents.length} agents in workspace ${workspaceId}`,
    );
  }
}
