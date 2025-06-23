import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuditExceptionFilter } from 'src/engine/core-modules/audit/audit-exception-filter';
import {
  AuditException,
  AuditExceptionCode,
} from 'src/engine/core-modules/audit/audit.exception';
import { CreateObjectEventInput } from 'src/engine/core-modules/audit/dtos/create-object-event.input';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import {
  CreateAnalyticsInputV2,
  isPageviewAnalyticsInput,
  isTrackAnalyticsInput,
} from './dtos/create-analytics.input';
import { Analytics } from './entities/analytics.entity';
import { AuditService } from './services/audit.service';

@Resolver(() => Analytics)
@UsePipes(ResolverValidationPipe)
@UseFilters(AuditExceptionFilter, PreventNestToAutoLogGraphqlErrorsFilter)
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  // preparing for new name
  async createPageview(
    @Args()
    createAnalyticsInput: CreateAnalyticsInputV2,
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
  ) {
    return this.trackAnalytics(createAnalyticsInput, workspace, user);
  }

  @Mutation(() => Analytics)
  @UseGuards(WorkspaceAuthGuard)
  async createObjectEvent(
    @Args()
    createObjectEventInput: CreateObjectEventInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
  ) {
    if (!workspace) {
      throw new AuditException(
        'Missing workspace',
        AuditExceptionCode.INVALID_INPUT,
      );
    }

    const analyticsContext = this.auditService.createContext({
      workspaceId: workspace.id,
      userId: user?.id,
    });

    return analyticsContext.createObjectEvent(createObjectEventInput.event, {
      ...createObjectEventInput.properties,
      recordId: createObjectEventInput.recordId,
      objectMetadataId: createObjectEventInput.objectMetadataId,
      isCustom: true,
    });
  }

  @Mutation(() => Analytics)
  @UseGuards(PublicEndpointGuard)
  async trackAnalytics(
    @Args()
    createAnalyticsInput: CreateAnalyticsInputV2,
    @AuthWorkspace({ allowUndefined: true }) workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
  ) {
    const analyticsContext = this.auditService.createContext({
      workspaceId: workspace?.id,
      userId: user?.id,
    });

    if (isPageviewAnalyticsInput(createAnalyticsInput)) {
      return analyticsContext.createPageviewEvent(
        createAnalyticsInput.name,
        createAnalyticsInput.properties ?? {},
      );
    }

    if (isTrackAnalyticsInput(createAnalyticsInput)) {
      // For track events, we need to determine if it's a workspace or object event
      // Since we don't have recordId and objectMetadataId in the input, we use insertWorkspaceEvent
      return analyticsContext.insertWorkspaceEvent(
        createAnalyticsInput.event,
        createAnalyticsInput.properties ?? {},
      );
    }

    throw new AuditException(
      'Invalid analytics input',
      AuditExceptionCode.INVALID_TYPE,
    );
  }
}
