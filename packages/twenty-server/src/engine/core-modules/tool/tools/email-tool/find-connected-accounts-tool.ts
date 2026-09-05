import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined, isNonEmptyString } from 'twenty-shared/utils';
import { IsNull, type Repository } from 'typeorm';

import {
  FindConnectedAccountsToolInputZodSchema,
  type FindConnectedAccountsToolInput,
} from 'src/engine/core-modules/tool/tools/email-tool/find-connected-accounts-tool.schema';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { isConnectedAccountUsableByCaller } from 'src/engine/metadata-modules/connected-account/utils/is-connected-account-usable-by-caller.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const normalizeHandle = (handle: string): string => handle.trim().toLowerCase();

@Injectable()
export class FindConnectedAccountsTool implements Tool {
  description =
    'List connected email accounts the caller can use with draft_email and send_email. Returns id, handle, provider, visibility and aliases from the core schema. Pass id as connectedAccountId. Do not guess UUIDs.';
  inputSchema = FindConnectedAccountsToolInputZodSchema;

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async execute(
    parameters: FindConnectedAccountsToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const authContext = buildSystemAuthContext(context.workspaceId);

    const accounts = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        return this.connectedAccountRepository.find({
          where: { workspaceId: context.workspaceId, archivedAt: IsNull() },
          order: { createdAt: 'ASC', id: 'ASC' },
          select: {
            id: true,
            handle: true,
            handleAliases: true,
            provider: true,
            name: true,
            visibility: true,
            userWorkspaceId: true,
          },
        });
      },
      authContext,
    );

    const userWorkspaceId = context.userWorkspaceId;
    const usableAccounts = isDefined(userWorkspaceId)
      ? accounts.filter((connectedAccount) =>
          isConnectedAccountUsableByCaller({
            connectedAccount,
            userWorkspaceId,
          }),
        )
      : accounts;

    const handleFilter = isNonEmptyString(parameters.handle)
      ? normalizeHandle(parameters.handle)
      : undefined;

    const matchingAccounts = isDefined(handleFilter)
      ? usableAccounts.filter((account) => {
          if (normalizeHandle(account.handle) === handleFilter) {
            return true;
          }

          return (account.handleAliases ?? []).some(
            (alias) => normalizeHandle(alias) === handleFilter,
          );
        })
      : usableAccounts;

    // MCP JSON is not GraphQL: never spread the entity (tokens are HideField-only).
    const records = matchingAccounts.map((account) => ({
      id: account.id,
      handle: account.handle,
      handleAliases: account.handleAliases,
      provider: account.provider,
      name: account.name,
      visibility: account.visibility,
    }));

    return {
      success: true,
      message:
        records.length === 0
          ? 'Found 0 connectedAccount records'
          : `Found ${records.length} connectedAccount record${records.length === 1 ? '' : 's'}`,
      result: {
        records,
        count: String(records.length),
      },
    };
  }
}
