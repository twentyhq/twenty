import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { CalendarEventRecordingPreferenceService } from 'src/engine/core-modules/calendar/calendar-event-recording-preference.service';
import { CalendarEventRecordingPreferenceDTO } from 'src/engine/core-modules/calendar/dtos/calendar-event-recording-preference.dto';
import { UpdateCalendarEventRecordingPreferenceInput } from 'src/engine/core-modules/calendar/dtos/update-calendar-event-recording-preference.input';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@CoreResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, CustomPermissionGuard)
@UsePipes(ResolverValidationPipe)
export class CalendarEventRecordingPreferenceResolver {
  constructor(
    private readonly calendarEventRecordingPreferenceService: CalendarEventRecordingPreferenceService,
  ) {}

  @Query(() => Boolean)
  async canUpdateCalendarEventRecordingPreference(
    @Args('calendarEventId', { type: () => UUIDScalarType })
    calendarEventId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<boolean> {
    return this.calendarEventRecordingPreferenceService.canUpdateCalendarEventRecordingPreference(
      {
        workspaceId: workspace.id,
        userWorkspaceId,
        workspaceMemberId,
        calendarEventId,
      },
    );
  }

  @Mutation(() => CalendarEventRecordingPreferenceDTO)
  async updateCalendarEventRecordingPreference(
    @Args('input') input: UpdateCalendarEventRecordingPreferenceInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<CalendarEventRecordingPreferenceDTO> {
    const authContext = getWorkspaceAuthContext();

    if (!isUserAuthContext(authContext)) {
      throw new AuthException(
        'Calendar event recording preference updates require user authentication.',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    return this.calendarEventRecordingPreferenceService.updateCalendarEventRecordingPreference(
      {
        workspaceId: workspace.id,
        userWorkspaceId,
        workspaceMemberId,
        calendarEventId: input.calendarEventId,
        recordingPreference: input.recordingPreference,
        authContext,
      },
    );
  }
}
