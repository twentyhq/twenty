import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { TWENTY_ICONS_BASE_URL } from 'twenty-shared/constants';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/engine/core-modules/auth/auth.util';
import {
  AuthProviderWithPasswordType,
  ExistingUserOrPartialUserWithPicture,
  PartialUserWithPicture,
  SignInUpBaseParams,
  SignInUpNewUserPayload,
} from 'src/engine/core-modules/auth/types/signInUp.type';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class SignInUpService {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly onboardingService: OnboardingService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly httpService: HttpService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainManagerService: DomainManagerService,
    private readonly userService: UserService,
  ) {}

  async computePartialUserFromUserPayload(
    newUserPayload: SignInUpNewUserPayload,
    authParams: AuthProviderWithPasswordType['authParams'],
  ): Promise<PartialUserWithPicture> {
    if (!newUserPayload?.email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: t`Email is required`,
        },
      );
    }

    const partialNewUser: PartialUserWithPicture = {
      email: newUserPayload.email,
      firstName: newUserPayload.firstName ?? '',
      lastName: newUserPayload.lastName ?? '',
      picture: newUserPayload.picture ?? '',
      locale: newUserPayload.locale ?? 'en',
      isEmailVerified: newUserPayload.isEmailAlreadyVerified,
    };

    if (authParams.provider === AuthProviderEnum.Password) {
      partialNewUser.passwordHash = await this.generateHash(
        authParams.password,
      );
    }

    return partialNewUser;
  }

  async signInUp(
    params: SignInUpBaseParams &
      ExistingUserOrPartialUserWithPicture &
      AuthProviderWithPasswordType,
  ) {
    if (params.workspace && params.invitation) {
      return {
        workspace: params.workspace,
        user: await this.signInUpWithPersonalInvitation({
          invitation: params.invitation,
          userData: params.userData,
        }),
      };
    }

    if (params.workspace) {
      const updatedUser = await this.signInUpOnExistingWorkspace({
        workspace: params.workspace,
        userData: params.userData,
      });

      return { user: updatedUser, workspace: params.workspace };
    }

    return await this.signUpOnNewWorkspace(params.userData);
  }

  async generateHash(password: string) {
    const isPasswordValid = PASSWORD_REGEX.test(password);

    if (!isPasswordValid) {
      throw new AuthException(
        'Password too weak',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: t`Password too weak`,
        },
      );
    }

    return await hashPassword(password);
  }

  async validatePassword({
    password,
    passwordHash,
  }: {
    password: string;
    passwordHash: string;
  }) {
    const isValid = await compareHash(password, passwordHash);

    if (!isValid) {
      throw new AuthException(
        'Wrong password',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: t`Wrong password`,
        },
      );
    }
  }

  private async signInUpWithPersonalInvitation(
    params: { invitation: AppToken } & ExistingUserOrPartialUserWithPicture,
  ) {
    if (!params.invitation) {
      throw new AuthException(
        'Invitation not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const email =
      params.userData.type === 'newUserWithPicture'
        ? params.userData.newUserWithPicture.email
        : params.userData.existingUser.email;

    if (!email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: t`Email is required`,
        },
      );
    }

    const invitationValidation =
      await this.workspaceInvitationService.validatePersonalInvitation({
        workspacePersonalInviteToken: params.invitation.value,
        email,
      });

    if (!invitationValidation?.isValid) {
      throw new AuthException(
        'Invitation not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const updatedUser = await this.signInUpOnExistingWorkspace({
      workspace: invitationValidation.workspace,
      userData: params.userData,
    });

    await this.workspaceInvitationService.invalidateWorkspaceInvitation(
      invitationValidation.workspace.id,
      email,
    );

    await this.userService.markEmailAsVerified(updatedUser.id);

    return updatedUser;
  }

  private async throwIfWorkspaceIsNotReadyForSignInUp(
    workspace: Workspace,
    user: ExistingUserOrPartialUserWithPicture,
  ) {
    if (workspace.activationStatus === WorkspaceActivationStatus.ACTIVE) return;

    if (user.userData.type !== 'existingUser') {
      throw new AuthException(
        'Workspace is not ready to welcome new members',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: t`Workspace is not ready to welcome new members`,
        },
      );
    }

    const userWorkspaceExists =
      await this.userWorkspaceService.checkUserWorkspaceExists(
        user.userData.existingUser.id,
        workspace.id,
      );

    if (!userWorkspaceExists) {
      throw new AuthException(
        'User is not part of the workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: t`User is not part of the workspace`,
        },
      );
    }
  }

  async signInUpOnExistingWorkspace(
    params: {
      workspace: Workspace;
    } & ExistingUserOrPartialUserWithPicture,
  ) {
    await this.throwIfWorkspaceIsNotReadyForSignInUp(params.workspace, params);

    const isNewUser = params.userData.type === 'newUserWithPicture';

    if (isNewUser) {
      const userData = params.userData as {
        type: 'newUserWithPicture';
        newUserWithPicture: PartialUserWithPicture;
      };

      const user = await this.saveNewUser(userData.newUserWithPicture, {
        canAccessFullAdminPanel: false,
        canImpersonate: false,
      });

      await this.activateOnboardingForUser(user, params.workspace);

      await this.userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace(
        user,
        params.workspace,
      );

      return user;
    }

    const userData = params.userData as {
      type: 'existingUser';
      existingUser: User;
    };

    const user = userData.existingUser;

    await this.userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace(
      user,
      params.workspace,
    );

    return user;
  }

  private async activateOnboardingForUser(user: User, workspace: Workspace) {
    await this.onboardingService.setOnboardingConnectAccountPending({
      userId: user.id,
      workspaceId: workspace.id,
      value: true,
    });

    if (user.firstName === '' && user.lastName === '') {
      await this.onboardingService.setOnboardingCreateProfilePending({
        userId: user.id,
        workspaceId: workspace.id,
        value: true,
      });
    }
  }

  private async saveNewUser(
    newUserWithPicture: PartialUserWithPicture,
    {
      canImpersonate,
      canAccessFullAdminPanel,
    }: {
      canImpersonate: boolean;
      canAccessFullAdminPanel: boolean;
    },
  ) {
    const userCreated = this.userRepository.create({
      ...newUserWithPicture,
      canImpersonate,
      canAccessFullAdminPanel,
    });

    const savedUser = await this.userRepository.save(userCreated);

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    this.workspaceEventEmitter.emitCustomBatchEvent(
      USER_SIGNUP_EVENT_NAME,
      [
        {
          userId: savedUser.id,
          userEmail: newUserWithPicture.email,
          userFirstName: newUserWithPicture.firstName,
          userLastName: newUserWithPicture.lastName,
          locale: newUserWithPicture.locale,
          serverUrl,
        },
      ],
      undefined,
    );

    return savedUser;
  }

  private async setDefaultImpersonateAndAccessFullAdminPanel() {
    if (!this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')) {
      const workspacesCount = await this.workspaceRepository.count();

      // let the creation of the first workspace
      if (workspacesCount > 0) {
        throw new AuthException(
          'New workspace setup is disabled',
          AuthExceptionCode.SIGNUP_DISABLED,
        );
      }

      return { canImpersonate: true, canAccessFullAdminPanel: true };
    }

    return { canImpersonate: false, canAccessFullAdminPanel: false };
  }

  async signUpOnNewWorkspace(
    userData: ExistingUserOrPartialUserWithPicture['userData'],
  ) {
    const email =
      userData.type === 'newUserWithPicture'
        ? userData.newUserWithPicture.email
        : userData.existingUser.email;

    if (!email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: t`Email is required`,
        },
      );
    }

    const { canImpersonate, canAccessFullAdminPanel } =
      await this.setDefaultImpersonateAndAccessFullAdminPanel();

    const logoUrl = `${TWENTY_ICONS_BASE_URL}/${getDomainNameByEmail(email)}`;
    const isLogoUrlValid = async () => {
      try {
        return (
          (await this.httpService.axiosRef.get(logoUrl, { timeout: 600 }))
            .status === 200
        );
      } catch {
        return false;
      }
    };

    const isWorkEmailFound = isWorkEmail(email);
    const logo =
      isWorkEmailFound && (await isLogoUrlValid()) ? logoUrl : undefined;

    const workspaceToCreate = this.workspaceRepository.create({
      subdomain: await this.domainManagerService.generateSubdomain(
        isWorkEmailFound ? { email } : {},
      ),
      displayName: '',
      inviteHash: v4(),
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      logo,
    });

    const workspace = await this.workspaceRepository.save(workspaceToCreate);

    const isExistingUser = userData.type === 'existingUser';
    const user = isExistingUser
      ? userData.existingUser
      : await this.saveNewUser(userData.newUserWithPicture, {
          canImpersonate,
          canAccessFullAdminPanel,
        });

    await this.userWorkspaceService.create({
      userId: user.id,
      workspaceId: workspace.id,
      isExistingUser,
      pictureUrl: isExistingUser
        ? undefined
        : userData.newUserWithPicture.picture,
    });

    await this.activateOnboardingForUser(user, workspace);

    await this.onboardingService.setOnboardingInviteTeamPending({
      workspaceId: workspace.id,
      value: true,
    });

    return { user, workspace };
  }

  async signUpWithoutWorkspace(
    newUserParams: SignInUpNewUserPayload,
    authParams: AuthProviderWithPasswordType['authParams'],
  ) {
    return this.saveNewUser(
      await this.computePartialUserFromUserPayload(newUserParams, authParams),
      await this.setDefaultImpersonateAndAccessFullAdminPanel(),
    );
  }
}
