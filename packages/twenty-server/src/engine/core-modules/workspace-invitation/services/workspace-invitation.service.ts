import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { render } from '@react-email/render';
import { SendInviteLinkEmail } from 'twenty-emails';
import { IsNull, Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { SendInvitationsOutput } from 'src/engine/core-modules/workspace-invitation/dtos/send-invitations.output';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceInvitationService {
  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly environmentService: EnvironmentService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly onboardingService: OnboardingService,
  ) {}

  private async getOneWorkspaceInvitation(workspaceId: string, email: string) {
    return await this.appTokenRepository
      .createQueryBuilder('appToken')
      .where('"appToken"."workspaceId" = :workspaceId', {
        workspaceId,
      })
      .andWhere('"appToken".type = :type', {
        type: AppTokenType.InvitationToken,
      })
      .andWhere('"appToken".context->>\'email\' = :email', { email })
      .getOne();
  }

  castAppTokenToWorkspaceInvitation(appToken: AppToken) {
    if (appToken.type !== AppTokenType.InvitationToken) {
      throw new WorkspaceInvitationException(
        `Token type must be "${AppTokenType.InvitationToken}"`,
        WorkspaceInvitationExceptionCode.INVALID_APP_TOKEN_TYPE,
      );
    }

    if (!appToken.context?.email) {
      throw new WorkspaceInvitationException(
        `Invitation corrupted: Missing email in context`,
        WorkspaceInvitationExceptionCode.INVITATION_CORRUPTED,
      );
    }

    return {
      id: appToken.id,
      email: appToken.context.email,
      expiresAt: appToken.expiresAt,
    };
  }

  async createWorkspaceInvitation(email: string, workspace: Workspace) {
    const maybeWorkspaceInvitation = await this.getOneWorkspaceInvitation(
      workspace.id,
      email.toLowerCase(),
    );

    if (maybeWorkspaceInvitation) {
      throw new WorkspaceInvitationException(
        `${email} already invited`,
        WorkspaceInvitationExceptionCode.INVITATION_ALREADY_EXIST,
      );
    }

    const isUserAlreadyInWorkspace = await this.userWorkspaceRepository.exists({
      where: {
        workspaceId: workspace.id,
        user: {
          email,
        },
      },
      relations: {
        user: true,
      },
    });

    if (isUserAlreadyInWorkspace) {
      throw new WorkspaceInvitationException(
        `${email} is already in the workspace`,
        WorkspaceInvitationExceptionCode.USER_ALREADY_EXIST,
      );
    }

    return this.tokenService.generateInvitationToken(workspace.id, email);
  }

  async loadWorkspaceInvitations(workspace: Workspace) {
    const appTokens = await this.appTokenRepository.find({
      where: {
        workspaceId: workspace.id,
        type: AppTokenType.InvitationToken,
        deletedAt: IsNull(),
      },
      select: {
        value: false,
      },
    });

    return appTokens.map(this.castAppTokenToWorkspaceInvitation);
  }

  async deleteWorkspaceInvitation(appTokenId: string, workspaceId: string) {
    const appToken = await this.appTokenRepository.findOne({
      where: {
        id: appTokenId,
        workspaceId,
        type: AppTokenType.InvitationToken,
      },
    });

    if (!appToken) {
      return 'error';
    }

    await this.appTokenRepository.delete(appToken.id);

    return 'success';
  }

  async invalidateWorkspaceInvitation(workspaceId: string, email: string) {
    const appToken = await this.getOneWorkspaceInvitation(workspaceId, email);

    if (appToken) {
      await this.appTokenRepository.delete(appToken.id);
    }
  }

  async resendWorkspaceInvitation(
    appTokenId: string,
    workspace: Workspace,
    sender: User,
  ) {
    const appToken = await this.appTokenRepository.findOne({
      where: {
        id: appTokenId,
        workspaceId: workspace.id,
        type: AppTokenType.InvitationToken,
      },
    });

    if (!appToken || !appToken.context || !('email' in appToken.context)) {
      throw new WorkspaceInvitationException(
        'Invalid appToken',
        WorkspaceInvitationExceptionCode.INVALID_INVITATION,
      );
    }

    await this.appTokenRepository.delete(appToken.id);

    return this.sendInvitations([appToken.context.email], workspace, sender);
  }

  async sendInvitations(
    emails: string[],
    workspace: Workspace,
    sender: User,
    usePersonalInvitation = true,
  ): Promise<SendInvitationsOutput> {
    if (!workspace?.inviteHash) {
      return {
        success: false,
        errors: ['Workspace invite hash not found'],
        result: [],
      };
    }

    const invitationsPr = await Promise.allSettled(
      emails.map(async (email) => {
        if (usePersonalInvitation) {
          const appToken = await this.createWorkspaceInvitation(
            email,
            workspace,
          );

          if (!appToken.context?.email) {
            throw new WorkspaceInvitationException(
              'Invalid email',
              WorkspaceInvitationExceptionCode.EMAIL_MISSING,
            );
          }

          return {
            isPersonalInvitation: true as const,
            appToken,
            email: appToken.context.email,
          };
        }

        return {
          isPersonalInvitation: false as const,
          email,
        };
      }),
    );

    const frontBaseURL = this.environmentService.get('FRONT_BASE_URL');

    for (const invitation of invitationsPr) {
      if (invitation.status === 'fulfilled') {
        const link = new URL(`${frontBaseURL}/invite/${workspace?.inviteHash}`);

        if (invitation.value.isPersonalInvitation) {
          link.searchParams.set('inviteToken', invitation.value.appToken.value);
        }
        const emailData = {
          link: link.toString(),
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
          to: invitation.value.email,
          subject: 'Join your team on Twenty',
          text,
          html,
        });
      }
    }

    await this.onboardingService.setOnboardingInviteTeamPending({
      workspaceId: workspace.id,
      value: false,
    });

    const result = invitationsPr.reduce<{
      errors: string[];
      result: ReturnType<
        typeof this.workspaceInvitationService.createWorkspaceInvitation
      >['status'] extends 'rejected'
        ? never
        : ReturnType<
            typeof this.workspaceInvitationService.appTokenToWorkspaceInvitation
          >;
    }>(
      (acc, invitation) => {
        if (invitation.status === 'rejected') {
          acc.errors.push(invitation.reason?.message ?? 'Unknown error');
        } else {
          acc.result.push(
            invitation.value.isPersonalInvitation
              ? this.castAppTokenToWorkspaceInvitation(
                  invitation.value.appToken,
                )
              : { email: invitation.value.email },
          );
        }

        return acc;
      },
      { errors: [], result: [] },
    );

    return {
      success: result.errors.length === 0,
      ...result,
    };
  }
}
