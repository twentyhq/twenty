import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { SendInviteLinkEmail } from 'twenty-emails';
import { IsNull, Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { SendInvitationsOutput } from 'src/engine/core-modules/workspace-invitation/dtos/send-invitations.output';
import { castAppTokenToWorkspaceInvitationUtil } from 'src/engine/core-modules/workspace-invitation/utils/cast-app-token-to-workspace-invitation.util';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceInvitationService {
  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly emailService: EmailService,
    private readonly onboardingService: OnboardingService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  async validatePersonalInvitation({
    workspacePersonalInviteToken,
    email,
  }: {
    workspacePersonalInviteToken?: string;
    email: string;
  }) {
    try {
      const appToken = await this.appTokenRepository.findOne({
        where: {
          value: workspacePersonalInviteToken,
          type: AppTokenType.InvitationToken,
        },
        relations: { workspace: true },
      });

      if (!appToken) {
        throw new Error('Invalid invitation token');
      }

      if (!appToken.context?.email || appToken.context?.email !== email) {
        throw new Error('Email does not match the invitation');
      }

      if (new Date(appToken.expiresAt) < new Date()) {
        throw new Error('Invitation expired');
      }

      return { isValid: true, workspace: appToken.workspace };
    } catch (err) {
      throw new AuthException(
        err.message,
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }
  }

  async findInvitationsByEmail(email: string) {
    return await this.appTokenRepository
      .createQueryBuilder('appToken')
      .innerJoinAndSelect('appToken.workspace', 'workspace')
      .where('"appToken".type = :type', {
        type: AppTokenType.InvitationToken,
      })
      .andWhere('"appToken".context->>\'email\' = :email', { email })
      .andWhere('appToken.deletedAt IS NULL')
      .andWhere('appToken.expiresAt > :now', {
        now: new Date(),
      })
      .getMany();
  }

  async getOneWorkspaceInvitation(workspaceId: string, email: string) {
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

  async getAppTokenByInvitationToken(invitationToken: string) {
    const appToken = await this.appTokenRepository.findOne({
      where: {
        value: invitationToken,
        type: AppTokenType.InvitationToken,
      },
      relations: { workspace: true },
    });

    if (!appToken) {
      throw new WorkspaceInvitationException(
        'Invalid invitation token',
        WorkspaceInvitationExceptionCode.INVALID_INVITATION,
      );
    }

    return appToken;
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

    return appTokens.map(castAppTokenToWorkspaceInvitationUtil);
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

    return this.generateInvitationToken(workspace.id, email);
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
    sender: WorkspaceMemberWorkspaceEntity,
  ) {
    const appToken = await this.appTokenRepository.findOne({
      where: {
        id: appTokenId,
        workspaceId: workspace.id,
        type: AppTokenType.InvitationToken,
      },
    });

    if (!appToken || !appToken.context?.email) {
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
    sender: WorkspaceMemberWorkspaceEntity,
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

    for (const invitation of invitationsPr) {
      if (invitation.status === 'fulfilled') {
        const link = this.domainManagerService.buildWorkspaceURL({
          workspace,
          pathname: `invite/${workspace?.inviteHash}`,
          searchParams: invitation.value.isPersonalInvitation
            ? {
                inviteToken: invitation.value.appToken.value,
                email: invitation.value.email,
              }
            : {},
        });

        const emailData = {
          link: link.toString(),
          workspace: { name: workspace.displayName, logo: workspace.logo },
          sender: {
            email: sender.userEmail,
            firstName: sender.name.firstName,
            lastName: sender.name.lastName,
          },
          serverUrl: this.twentyConfigService.get('SERVER_URL'),
          locale: sender.locale,
        };

        const emailTemplate = SendInviteLinkEmail(emailData);
        const html = render(emailTemplate);
        const text = render(emailTemplate, {
          plainText: true,
        });

        i18n.activate(sender.locale);

        await this.emailService.send({
          from: `${sender.name.firstName} ${sender.name.lastName} (via Twenty) <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
          to: invitation.value.email,
          subject: t`Join your team on Twenty`,
          text,
          html,
        });
      }
    }

    await this.onboardingService.setOnboardingInviteTeamPending({
      workspaceId: workspace.id,
      value: false,
    });

    await this.onboardingService.setOnboardingBookOnboardingPending({
      workspaceId: workspace.id,
      value: true,
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
              ? castAppTokenToWorkspaceInvitationUtil(invitation.value.appToken)
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

  async generateInvitationToken(workspaceId: string, email: string) {
    const expiresIn = this.twentyConfigService.get(
      'INVITATION_TOKEN_EXPIRES_IN',
    );

    if (!expiresIn) {
      throw new AuthException(
        'Expiration time for invitation token is not set',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const invitationToken = this.appTokenRepository.create({
      workspaceId,
      expiresAt,
      type: AppTokenType.InvitationToken,
      value: crypto.randomBytes(32).toString('hex'),
      context: {
        email,
      },
    });

    return this.appTokenRepository.save(invitationToken);
  }
}
