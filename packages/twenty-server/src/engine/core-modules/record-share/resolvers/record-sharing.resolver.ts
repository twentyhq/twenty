import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RecordSharePrincipalInput,
  RecordSharingDTO,
} from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { RecordTargetInput } from 'src/engine/metadata-modules/record-permissions/dtos/record-target.input';

@MetadataResolver()
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  }),
  CustomPermissionGuard,
)
export class RecordSharingResolver {
  constructor(private readonly sharingService: RecordSharingService) {}

  @Query(() => RecordSharingDTO)
  recordSharing(@Args('target') target: RecordTargetInput) {
    return this.sharingService.getSharing({
      ...target,
      authContext: this.getUserContext(),
    });
  }

  @Mutation(() => RecordSharingDTO)
  setRecordGeneralAccess(
    @Args('target') target: RecordTargetInput,
    @Args('accessLevel', { type: () => RecordShareAccessLevel })
    accessLevel: RecordShareAccessLevel,
  ) {
    return this.sharingService.setGeneralAccess({
      ...target,
      accessLevel,
      authContext: this.getUserContext(),
    });
  }

  @Mutation(() => RecordSharingDTO)
  setRecordShare(
    @Args('target') target: RecordTargetInput,
    @Args('principal') principal: RecordSharePrincipalInput,
    @Args('accessLevel', { type: () => RecordShareAccessLevel })
    accessLevel: RecordShareAccessLevel,
  ) {
    return this.sharingService.setShare({
      ...target,
      principal,
      accessLevel,
      authContext: this.getUserContext(),
    });
  }

  @Mutation(() => RecordSharingDTO)
  removeRecordShare(
    @Args('target') target: RecordTargetInput,
    @Args('principal') principal: RecordSharePrincipalInput,
  ) {
    return this.sharingService.removeShare({
      ...target,
      principal,
      authContext: this.getUserContext(),
    });
  }

  private getUserContext() {
    const authContext = getWorkspaceAuthContext();
    if (!isUserAuthContext(authContext)) {
      throw new AuthenticationError('User authentication required');
    }
    return authContext;
  }
}
