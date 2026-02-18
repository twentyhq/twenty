import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { TWENTY_ICONS_BASE_URL } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository, type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
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
  type AuthProviderWithPasswordType,
  type ExistingUserOrPartialUserWithPicture,
  type PartialUserWithPicture,
  type SignInUpBaseParams,
  type SignInUpNewUserPayload,
} from 'src/engine/core-modules/auth/types/signInUp.type';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
// eslint-disable-next-line twenty/inject-workspace-repository
export class SignInUpService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly onboardingService: OnboardingService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly subdomainManagerService: SubdomainManagerService,
    private readonly userService: UserService,
    private readonly metricsService: MetricsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly fileCorePictureService: FileCorePictureService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
          userFriendlyMessage: msg`Email is required`,
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
          userFriendlyMessage: msg`Password too weak`,
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
          userFriendlyMessage: msg`Wrong password`,
        },
      );
    }
  }

  private async signInUpWithPersonalInvitation(
    params: {
      invitation: AppTokenEntity;
    } & ExistingUserOrPartialUserWithPicture,
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
          userFriendlyMessage: msg`Email is required`,
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
    workspace: WorkspaceEntity,
    user: ExistingUserOrPartialUserWithPicture,
  ) {
    if (workspace.activationStatus === WorkspaceActivationStatus.ACTIVE) return;

    if (user.userData.type !== 'existingUser') {
      throw new AuthException(
        'Workspace is not ready to welcome new members',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`Workspace is not ready to welcome new members`,
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
          userFriendlyMessage: msg`User is not part of the workspace`,
        },
      );
    }
  }

  async signInUpOnExistingWorkspace(
    params: {
      workspace: WorkspaceEntity;
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

      await this.activateOnboardingForUser({
        user,
        workspace: params.workspace,
        shouldShowConnectAccountStep: false,
      });

      await this.userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace(
        user,
        params.workspace,
      );

      return user;
    }

    const userData = params.userData as {
      type: 'existingUser';
      existingUser: UserEntity;
    };

    const user = userData.existingUser;

    await this.userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace(
      user,
      params.workspace,
    );

    return user;
  }

  private async activateOnboardingForUser(
    {
      user,
      workspace,
      shouldShowConnectAccountStep,
    }: {
      user: UserEntity;
      workspace: WorkspaceEntity;
      shouldShowConnectAccountStep: boolean;
    },
    queryRunner?: QueryRunner,
  ) {
    if (shouldShowConnectAccountStep) {
      await this.onboardingService.setOnboardingConnectAccountPending(
        {
          userId: user.id,
          workspaceId: workspace.id,
          value: true,
        },
        queryRunner,
      );
    }

    if (user.firstName === '' && user.lastName === '') {
      await this.onboardingService.setOnboardingCreateProfilePending(
        {
          userId: user.id,
          workspaceId: workspace.id,
          value: true,
        },
        queryRunner,
      );
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
    queryRunner?: QueryRunner,
  ) {
    const userCreated = this.userRepository.create({
      ...newUserWithPicture,
      canImpersonate,
      canAccessFullAdminPanel,
    });

    const savedUser = queryRunner
      ? await queryRunner.manager.save(UserEntity, userCreated)
      : await this.userRepository.save(userCreated);

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

    this.metricsService.incrementCounter({
      key: MetricsKeys.SignUpSuccess,
      shouldStoreInCache: false,
    });

    return savedUser;
  }

  private async isSignUpEnabled(): Promise<boolean> {
    const workspaceCount = await this.workspaceRepository.count();

    return (
      this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED') ||
      workspaceCount === 0
    );
  }

  private async assertSignUpEnabled(): Promise<void> {
    if (!(await this.isSignUpEnabled())) {
      throw new AuthException(
        'New workspace setup is disabled',
        AuthExceptionCode.SIGNUP_DISABLED,
      );
    }
  }

  private async hasServerAdmin(): Promise<boolean> {
    const adminCount = await this.userRepository.count({
      where: { canAccessFullAdminPanel: true },
    });

    return adminCount > 0;
  }

  private async assertWorkspaceCreationAllowed(
    userData: ExistingUserOrPartialUserWithPicture['userData'],
  ): Promise<void> {
    await this.assertSignUpEnabled();

    const workspaceCount = await this.workspaceRepository.count();

    if (workspaceCount === 0) {
      return;
    }

    if (
      !this.twentyConfigService.get(
        'IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS',
      )
    ) {
      return;
    }

    const isExistingAdmin =
      userData.type === 'existingUser' &&
      userData.existingUser.canAccessFullAdminPanel;

    if (isExistingAdmin) {
      return;
    }

    throw new AuthException(
      'Workspace creation is restricted to admins',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
      {
        userFriendlyMessage: msg`Workspace creation is restricted to admins`,
      },
    );
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
          userFriendlyMessage: msg`Email is required`,
        },
      );
    }

    await this.assertWorkspaceCreationAllowed(userData);

    const shouldGrantServerAdmin = !(await this.hasServerAdmin());

    const isWorkEmailFound = isWorkEmail(email);

    const workspaceId = v4();
    const workspaceCustomApplicationId = v4();
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workspaceToCreate = this.workspaceRepository.create({
        id: workspaceId,
        subdomain: await this.subdomainManagerService.generateSubdomain(
          isWorkEmailFound ? { userEmail: email } : {},
        ),
        workspaceCustomApplicationId,
        displayName: '',
        inviteHash: v4(),
        activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      });

      const workspace = await queryRunner.manager.save(
        WorkspaceEntity,
        workspaceToCreate,
      );

      const customApplication =
        await this.applicationService.createWorkspaceCustomApplication(
          {
            workspaceId,
            applicationId: workspaceCustomApplicationId,
          },
          queryRunner,
        );

      if (isWorkEmailFound) {
        const logoUrl = `${TWENTY_ICONS_BASE_URL}/${getDomainNameByEmail(email)}`;
        const logoFile =
          await this.fileCorePictureService.uploadWorkspaceLogoFromUrl({
            imageUrl: logoUrl,
            workspaceId,
            applicationUniversalIdentifier:
              customApplication.universalIdentifier,
            queryRunner,
          });

        if (isDefined(logoFile)) {
          await queryRunner.manager.update(
            WorkspaceEntity,
            { id: workspaceId },
            { logoFileId: logoFile.id },
          );
        }
      }

      const isExistingUser = userData.type === 'existingUser';
      const user = isExistingUser
        ? userData.existingUser
        : await this.saveNewUser(
            userData.newUserWithPicture,
            {
              canImpersonate: shouldGrantServerAdmin,
              canAccessFullAdminPanel: shouldGrantServerAdmin,
            },
            queryRunner,
          );

      await this.userWorkspaceService.create(
        {
          userId: user.id,
          workspaceId: workspace.id,
          isExistingUser,
          pictureUrl: isExistingUser
            ? undefined
            : userData.newUserWithPicture.picture,
          applicationUniversalIdentifier: customApplication.universalIdentifier,
        },
        queryRunner,
      );

      await this.activateOnboardingForUser(
        { user, workspace, shouldShowConnectAccountStep: true },
        queryRunner,
      );

      await this.onboardingService.setOnboardingInviteTeamPending(
        {
          workspaceId: workspace.id,
          value: true,
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

      return { user, workspace };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async signUpWithoutWorkspace(
    newUserParams: SignInUpNewUserPayload,
    authParams: AuthProviderWithPasswordType['authParams'],
  ) {
    const userExists = await this.userService.findUserByEmail(
      newUserParams.email,
    );

    if (userExists) {
      throw new AuthException(
        'User already exists',
        AuthExceptionCode.USER_ALREADY_EXISTS,
        { userFriendlyMessage: msg`User already exists` },
      );
    }

    await this.assertSignUpEnabled();

    const shouldGrantServerAdmin = !(await this.hasServerAdmin());

    return this.saveNewUser(
      await this.computePartialUserFromUserPayload(newUserParams, authParams),
      {
        canImpersonate: shouldGrantServerAdmin,
        canAccessFullAdminPanel: shouldGrantServerAdmin,
      },
    );
  }
}
