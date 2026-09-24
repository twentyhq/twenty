import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, registerEnumType } from '@nestjs/graphql';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RecordSharingDTO,
  RecordSharingTargetInput,
  RecordSharePrincipalInput,
} from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { RecordShareException } from 'src/engine/core-modules/record-share/record-share.exception';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { recordShareGraphqlApiExceptionHandler } from 'src/engine/core-modules/record-share/utils/record-share-graphql-api-exception-handler.util';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

registerEnumType(RecordShareAccessLevel, { name: 'RecordShareAccessLevel' });

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, CustomPermissionGuard)
export class RecordSharingResolver {
  constructor(private readonly sharingService: RecordSharingService) {}

  @Query(() => RecordSharingDTO)
  recordSharing(@Args('target') target: RecordSharingTargetInput) {
    return this.sharingService.getSharing({
      ...target,
      authContext: this.getUserContext(),
    });
  }

  @Mutation(() => RecordSharingDTO)
  async setRecordShare(
    @Args('target') target: RecordSharingTargetInput,
    @Args('principal') principal: RecordSharePrincipalInput,
    @Args('enabled') enabled: boolean,
    @Args('accessLevel', {
      type: () => RecordShareAccessLevel,
      nullable: true,
      defaultValue: RecordShareAccessLevel.READ,
    })
    accessLevel: RecordShareAccessLevel | null,
  ) {
    try {
      return await this.sharingService.setShare({
        ...target,
        principal,
        enabled,
        accessLevel: accessLevel ?? RecordShareAccessLevel.READ,
        authContext: this.getUserContext(),
      });
    } catch (error) {
      if (error instanceof RecordShareException) {
        recordShareGraphqlApiExceptionHandler(error);
      }
      throw error;
    }
  }

  private getUserContext() {
    const authContext = getWorkspaceAuthContext();
    if (!isUserAuthContext(authContext)) {
      throw new AuthenticationError('User authentication required');
    }
    return authContext;
  }
}
