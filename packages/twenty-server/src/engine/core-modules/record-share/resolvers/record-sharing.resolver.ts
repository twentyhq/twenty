import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { RecordPermissionExplanationService } from 'src/engine/core-modules/record-permission/services/record-permission-explanation.service';

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RecordSharePrincipalInput,
  RecordSharingDTO,
} from 'src/engine/core-modules/record-share/dtos/record-sharing.dto';
import { RecordShareException } from 'src/engine/core-modules/record-share/record-share.exception';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { recordShareGraphqlApiExceptionHandler } from 'src/engine/core-modules/record-share/utils/record-share-graphql-api-exception-handler.util';
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
  constructor(
    private readonly sharingService: RecordSharingService,
    private readonly explanationService: RecordPermissionExplanationService,
  ) {}

  @Query(() => GraphQLJSON)
  explainRecordPermission(
    @Args('target') target: RecordTargetInput,
    @Args('workspaceMemberId', { type: () => UUIDScalarType })
    workspaceMemberId: string,
    @Args('action') action: string,
  ) {
    return this.explanationService.explain({
      authContext: this.getUserContext(),
      target,
      workspaceMemberId,
      action,
    });
  }

  @Query(() => RecordSharingDTO)
  recordSharing(
    @Args('target') target: RecordTargetInput,
    @Args('inheritedSharesAfter', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    inheritedSharesAfter?: string,
    @Args('sharesAfter', { type: () => UUIDScalarType, nullable: true })
    sharesAfter?: string,
  ) {
    return this.sharingService.getSharing({
      ...target,
      inheritedSharesAfter,
      sharesAfter,
      authContext: this.getUserContext(),
    });
  }

  @Mutation(() => RecordSharingDTO)
  setRecordGeneralAccess(
    @Args('target') target: RecordTargetInput,
    @Args('accessLevel', { type: () => RecordShareAccessLevel })
    accessLevel: RecordShareAccessLevel,
  ) {
    return this.handleRecordShareException(() =>
      this.sharingService.setGeneralAccess({
        ...target,
        accessLevel,
        authContext: this.getUserContext(),
      }),
    );
  }

  @Mutation(() => RecordSharingDTO)
  setRecordShare(
    @Args('target') target: RecordTargetInput,
    @Args('principal') principal: RecordSharePrincipalInput,
    @Args('accessLevel', { type: () => RecordShareAccessLevel })
    accessLevel: RecordShareAccessLevel,
  ) {
    return this.handleRecordShareException(() =>
      this.sharingService.setShare({
        ...target,
        principal,
        accessLevel,
        authContext: this.getUserContext(),
      }),
    );
  }

  @Mutation(() => RecordSharingDTO)
  removeRecordShare(
    @Args('target') target: RecordTargetInput,
    @Args('principal') principal: RecordSharePrincipalInput,
  ) {
    return this.handleRecordShareException(() =>
      this.sharingService.removeShare({
        ...target,
        principal,
        authContext: this.getUserContext(),
      }),
    );
  }

  private async handleRecordShareException(
    change: () => Promise<RecordSharingDTO>,
  ): Promise<RecordSharingDTO> {
    try {
      return await change();
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
