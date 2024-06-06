import { Injectable } from '@nestjs/common';

import {
  KeyValuePairService,
  KeyValueTypes,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { WorkspaceStates } from 'src/engine/core-modules/workspace-state/enums/workspace-states.enum';
import { WorkspaceStateInviteTeamValues } from 'src/engine/core-modules/workspace-state/enums/values/workspace-state-invite-team-values.enum';
import { WorkspaceStateResult } from 'src/engine/core-modules/workspace-state/dtos/workspace-state-result';
import { WorkspaceState } from 'src/engine/core-modules/workspace-state/dtos/workspace-state.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class WorkspaceStateService {
  constructor(
    private readonly keyValuePairService: KeyValuePairService<KeyValueTypes.WORKSPACE_STATE>,
  ) {}

  async getWorkspaceState(workspace: Workspace): Promise<WorkspaceState> {
    const skipInviteTeam = await this.keyValuePairService.get({
      workspaceId: workspace.id,
      key: WorkspaceStates.INVITE_TEAM_ONBOARDING_STEP,
    });

    return {
      skipInviteTeamOnboardingStep:
        !!skipInviteTeam &&
        skipInviteTeam.value === WorkspaceStateInviteTeamValues.SKIPPED,
    };
  }

  async skipInviteEmailOnboardingStep(
    workspaceId: string,
  ): Promise<WorkspaceStateResult> {
    await this.keyValuePairService.set({
      workspaceId,
      key: WorkspaceStates.INVITE_TEAM_ONBOARDING_STEP,
      value: WorkspaceStateInviteTeamValues.SKIPPED,
    });

    return { success: true };
  }
}
