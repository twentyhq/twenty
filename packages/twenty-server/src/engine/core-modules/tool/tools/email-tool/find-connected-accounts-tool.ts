import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { FindConnectedAccountsToolInputZodSchema } from 'src/engine/core-modules/tool/tools/email-tool/find-connected-accounts-tool.schema';
import { type FindConnectedAccountsToolInput } from 'src/engine/core-modules/tool/tools/email-tool/types/find-connected-accounts-tool-input.type';
import { filterConnectedAccountsByHandle } from 'src/engine/core-modules/tool/tools/email-tool/utils/filter-connected-accounts-by-handle.util';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';

@Injectable()
export class FindConnectedAccountsTool implements Tool {
  description =
    'List connected email accounts the caller can use with draft_email and send_email. Returns id, handle, provider, visibility and aliases. Use a returned id as connectedAccountId.';
  inputSchema = FindConnectedAccountsToolInputZodSchema;

  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  async execute(
    { handle }: FindConnectedAccountsToolInput,
    { workspaceId, userWorkspaceId }: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const usableAccounts =
      await this.connectedAccountMetadataService.findUsableByCallerWithoutCredentials(
        {
          workspaceId,
          userWorkspaceId,
        },
      );

    const matchingAccounts = isNonEmptyString(handle)
      ? filterConnectedAccountsByHandle({
          connectedAccounts: usableAccounts,
          handle,
        })
      : usableAccounts;

    const records = matchingAccounts.map((connectedAccount) => ({
      id: connectedAccount.id,
      handle: connectedAccount.handle,
      handleAliases: connectedAccount.handleAliases,
      provider: connectedAccount.provider,
      name: connectedAccount.name,
      visibility: connectedAccount.visibility,
    }));

    return {
      success: true,
      message: `Found ${records.length} connectedAccount record${records.length === 1 ? '' : 's'}`,
      result: {
        records,
        count: String(records.length),
      },
    };
  }
}
