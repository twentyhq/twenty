import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';
import { SendInviteLinkEmail } from 'twenty-emails';
import { render } from '@react-email/render';

import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { BillingService } from 'src/engine/core-modules/billing/billing.service';
import { SendInviteLink } from 'src/engine/core-modules/workspace/dtos/send-invite-link.entity';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';

export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly billingService: BillingService,
    private readonly environmentService: EnvironmentService,
    private readonly emailService: EmailService,
    private readonly onboardingService: OnboardingService,
  ) {
    super(workspaceRepository);
  }

  async activateWorkspace(user: User, data: ActivateWorkspaceInput) {
    if (!data.displayName || !data.displayName.length) {
      throw new BadRequestException("'displayName' not provided");
    }
    await this.workspaceRepository.update(user.defaultWorkspace.id, {
      displayName: data.displayName,
    });
    await this.workspaceManagerService.init(user.defaultWorkspace.id);
    await this.userWorkspaceService.createWorkspaceMember(
      user.defaultWorkspace.id,
      user,
    );

    return user.defaultWorkspace;
  }

  async isWorkspaceActivated(id: string): Promise<boolean> {
    return await this.workspaceManagerService.doesDataSourceExist(id);
  }

  async softDeleteWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findOneBy({ id });

    assert(workspace, 'Workspace not found');

    await this.userWorkspaceRepository.delete({ workspaceId: id });
    await this.billingService.deleteSubscription(workspace.id);

    await this.workspaceManagerService.delete(id);

    return workspace;
  }

  async deleteWorkspace(id: string) {
    const userWorkspaces = await this.userWorkspaceRepository.findBy({
      workspaceId: id,
    });

    const workspace = await this.softDeleteWorkspace(id);

    for (const userWorkspace of userWorkspaces) {
      await this.handleRemoveWorkspaceMember(id, userWorkspace.userId);
    }

    await this.workspaceRepository.delete(id);

    return workspace;
  }

  async getWorkspaceIds() {
    return this.workspaceRepository
      .find()
      .then((workspaces) => workspaces.map((workspace) => workspace.id));
  }

  async handleRemoveWorkspaceMember(workspaceId: string, userId: string) {
    await this.userWorkspaceRepository.delete({
      userId,
      workspaceId,
    });
    await this.onboardingService.skipInviteTeamOnboardingStep(workspaceId);
    await this.reassignOrRemoveUserDefaultWorkspace(workspaceId, userId);
  }

  async sendInviteLink(
    emails: string[],
    workspace: Workspace,
    sender: User,
  ): Promise<SendInviteLink> {
    if (!workspace?.inviteHash) {
      return { success: false };
    }

    const frontBaseURL = this.environmentService.get('FRONT_BASE_URL');
    const inviteLink = `${frontBaseURL}/invite/${workspace.inviteHash}`;

    for (const email of emails) {
      const emailData = {
        link: inviteLink,
        workspace: { name: workspace.displayName, logo: workspace.logo },
        sender: { email: sender.email, firstName: sender.firstName },
        serverUrl: this.environmentService.get('SERVER_URL'),
      };
      const emailTemplate = SendInviteLinkEmail(emailData);
      const html = render(emailTemplate, {
        pretty: true,
      });

      const text = render(emailTemplate, {
        plainText: true,
      });

      await this.emailService.send({
        from: `${this.environmentService.get(
          'EMAIL_FROM_NAME',
        )} <${this.environmentService.get('EMAIL_FROM_ADDRESS')}>`,
        to: email,
        subject: 'Join your team on Twenty',
        text,
        html,
      });
    }

    await this.onboardingService.skipInviteTeamOnboardingStep(workspace.id);

    return { success: true };
  }

  private async reassignOrRemoveUserDefaultWorkspace(
    workspaceId: string,
    userId: string,
  ) {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId: userId },
    });

    if (userWorkspaces.length === 0) {
      await this.userRepository.delete({ id: userId });

      return;
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found in workspace ${workspaceId}`);
    }

    if (user.defaultWorkspaceId === workspaceId) {
      await this.userRepository.update(
        { id: userId },
        {
          defaultWorkspaceId: userWorkspaces[0].workspaceId,
        },
      );
    }
  }
}
