import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { SendInviteLinkEmail } from 'twenty-emails';
import { AppPath, FileFolder } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type SendInvitationsDTO } from 'src/engine/core-modules/workspace-invitation/dtos/send-invitations.dto';
import { castAppTokenToWorkspaceInvitationUtil } from 'src/engine/core-modules/workspace-invitation/utils/cast-app-token-to-workspace-invitation.util';
import {
  WorkspaceInvitationException,
  WorkspaceInvitationExceptionCode,
} from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleValidationService } from 'src/engine/metadata-modules/role-validation/services/role-validation.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { CustomException } from 'src/utils/custom-exception';

@Injectable()
export class WorkspaceInvitationService {
  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly roleValidationService: RoleValidationService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly emailService: EmailService,
    private readonly onboardingService: OnboardingService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly i18nService: I18nService,
    private readonly throttlerService: ThrottlerService,
    private readonly fileUrlService: FileUrlService,
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

  async loadWorkspaceInvitations(workspace: WorkspaceEntity) {
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

  async createWorkspaceInvitation(
    email: string,
    workspace: WorkspaceEntity,
    roleId?: string,
  ) {
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

    return this.generateInvitationToken(workspace.id, email, roleId);
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

    if (!isDefined(appToken)) {
      return;
    }

    await this.appTokenRepository.delete(appToken.id);
  }

  async resendWorkspaceInvitation(
    appTokenId: string,
    workspace: WorkspaceEntity,
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

    return this.sendInvitations(
      [appToken.context.email],
      workspace,
      sender,
      appToken.context.roleId,
    );
  }

  async sendInvitations(
    emails: string[],
    workspace: WorkspaceEntity,
    sender: WorkspaceMemberWorkspaceEntity,
    roleId?: string,
  ): Promise<SendInvitationsDTO> {
    if (!workspace?.inviteHash) {
      return {
        success: false,
        errors: ['Workspace invite hash not found'],
        result: [],
      };
    }

    if (isDefined(roleId)) {
      await this.roleValidationService.validateRoleAssignableToUsersOrThrow(
        roleId,
        workspace.id,
      );
    }

    await this.throttleInvitationSending(workspace.id, emails);

    const invitationResults = await Promise.allSettled(
      emails.map(async (email) => {
        const appToken = await this.createWorkspaceInvitation(
          email,
          workspace,
          roleId,
        );

        if (!appToken.context?.email) {
          throw new WorkspaceInvitationException(
            'Invalid email',
            WorkspaceInvitationExceptionCode.EMAIL_MISSING,
          );
        }

        return { appToken, email: appToken.context.email };
      }),
    );

    for (const invitation of invitationResults) {
      if (invitation.status === 'fulfilled') {
        const link = this.workspaceDomainsService.buildWorkspaceURL({
          workspace,
          pathname: getAppPath(AppPath.Invite, {
            workspaceInviteHash: workspace?.inviteHash,
          }),
          searchParams: {
            inviteToken: invitation.value.appToken.value,
            email: invitation.value.email,
          },
        });

        if (!isDefined(sender.userEmail)) {
          throw new WorkspaceInvitationException(
            'Sender email is missing',
            WorkspaceInvitationExceptionCode.EMAIL_MISSING,
          );
        }

        const emailData = {
          link: link.toString(),
          workspace: {
            name: workspace.displayName,
            logo: isDefined(workspace.logoFileId)
              ? this.fileUrlService.signFileByIdUrl({
                  fileId: workspace.logoFileId,
                  workspaceId: workspace.id,
                  fileFolder: FileFolder.CorePicture,
                })
              : undefined,
          },
          sender: {
            email: sender.userEmail,
            firstName: sender.name.firstName,
            lastName: sender.name.lastName,
          },
          serverUrl: this.twentyConfigService.get('SERVER_URL'),
          locale: sender.locale,
        };

        const emailTemplate = SendInviteLinkEmail(emailData);
        const html = await render(emailTemplate);
        const text = await render(emailTemplate, {
          plainText: true,
        });

        const joinTeamMsg = msg`Join your team on Twenty`;
        const i18n = this.i18nService.getI18nInstance(sender.locale);
        const subject = i18n._(joinTeamMsg);

        await this.emailService.send({
          from: `${sender.name.firstName} ${sender.name.lastName} (via Twenty) <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
          to: invitation.value.email,
          subject,
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

    const i18n = this.i18nService.getI18nInstance(sender.locale);

    const result = invitationResults.reduce<{
      errors: string[];
      result: ReturnType<typeof castAppTokenToWorkspaceInvitationUtil>[];
    }>(
      (acc, invitation) => {
        if (invitation.status === 'rejected') {
          const reason = invitation.reason;

          if (reason instanceof CustomException && reason.userFriendlyMessage) {
            acc.errors.push(i18n._(reason.userFriendlyMessage));
          } else {
            acc.errors.push(reason?.message ?? 'Unknown error');
          }
        } else {
          acc.result.push(
            castAppTokenToWorkspaceInvitationUtil(invitation.value.appToken),
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

  async generateInvitationToken(
    workspaceId: string,
    email: string,
    roleId?: string,
  ) {
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
        ...(isDefined(roleId) ? { roleId } : {}),
      },
    });

    return this.appTokenRepository.save(invitationToken);
  }

  private async throttleInvitationSending(
    workspaceId: string,
    emails: string[],
  ) {
    try {
      //limit invitation sending for specific invite emails
      await Promise.all(
        emails.map(async (email) => {
          await this.throttlerService.tokenBucketThrottleOrThrow(
            `invitation-resending-workspace:throttler:${email}`,
            1,
            this.twentyConfigService.get(
              'INVITATION_SENDING_BY_EMAIL_THROTTLE_LIMIT',
            ),
            this.twentyConfigService.get(
              'INVITATION_SENDING_BY_EMAIL_THROTTLE_TTL_IN_MS',
            ),
          );
        }),
      );

      //limit invitation sending for a specific workspace
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `invitation-resending-workspace:throttler:${workspaceId}`,
        emails.length,
        this.twentyConfigService.get(
          'INVITATION_SENDING_BY_WORKSPACE_THROTTLE_LIMIT',
        ),
        this.twentyConfigService.get(
          'INVITATION_SENDING_BY_WORKSPACE_THROTTLE_TTL_IN_MS',
        ),
      );
    } catch {
      throw new WorkspaceInvitationException(
        'Workspace invitation sending rate limit exceeded.',
        WorkspaceInvitationExceptionCode.INVALID_INVITATION,
        {
          userFriendlyMessage: msg`Too many workspace invitations sent. Please try again later.`,
        },
      );
    }
  }
}
