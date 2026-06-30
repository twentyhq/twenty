import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { TWENTY_ICONS_BASE_URL } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  QueryFailedError,
  Repository,
  type DataSource,
  type QueryRunner,
} from 'typeorm';
import { v4 } from 'uuid';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { USER_SIGNUP_EVENT_NAME } from 'src/engine/api/graphql/workspace-query-runner/constants/user-signup-event-name.constants';
import { type QueryFailedErrorWithCode } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { USER_SIGNUP_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/user/user-signup';
import { WORKSPACE_CREATED_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/workspace/workspace-created';
import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/engine/core-modules/auth/auth.util';
import { MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/auth/constants/max-workspaces-without-enterprise-key.constants';
import { DEFAULT_DPA_REGION } from 'src/engine/core-modules/dpa/config/dpa-region-config.constant';
import { DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';
import { DpaAgreementType } from 'src/engine/core-modules/dpa/enums/dpa-agreement-type.enum';
import { buildDpaAgreementRecord } from 'src/engine/core-modules/dpa/utils/build-dpa-agreement-record.util';
import {
  type AuthProviderWithPasswordType,
  type ExistingUserOrPartialUserWithPicture,
  type PartialUserWithPicture,
  type SignInUpBaseParams,
  type SignInUpNewUserPayload,
} from 'src/engine/core-modules/auth/types/signInUp.type';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TelemetryEventType } from 'src/engine/core-modules/telemetry/telemetry-event.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { getDomainFromEmailOrThrow } from 'src/utils/get-domain-from-email-or-throw';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
// oxlint-disable-next-line twenty/inject-workspace-repository
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
    private readonly twentyConfigService: TwentyConfigService,
    private readonly subdomainManagerService: SubdomainManagerService,
    private readonly userService: UserService,
    private readonly metricsService: MetricsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly fileCorePictureService: FileCorePictureService,
    private readonly enterprisePlanService: EnterprisePlanService,
    private readonly eventLogEmitterService: EventLogEmitterService,
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
      roleId: params.invitation.context?.roleId,
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
        'Workspace is not ready to welcome new members',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`Workspace is not ready to welcome new members`,
        },
      );
    }
  }

  async signInUpOnExistingWorkspace(
    params: {
      workspace: WorkspaceEntity;
      roleId?: string | null;
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
        params.roleId,
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
      params.roleId,
    );

    return user;
  }

  private async activateOnboardingForUser(
    {
      user,
      workspace,
      shouldShowConnectAccountStep,
    }: {
      user: Pick<UserEntity, 'id' | 'firstName' | 'lastName'>;
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

    await this.onboardingService.setOnboardingCreateProfilePending(
      {
        userId: user.id,
        workspaceId: workspace.id,
        value: true,
      },
      queryRunner,
    );
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

    this.workspaceEventEmitter.emitCustomBatchEvent<TelemetryEventType>(
      USER_SIGNUP_EVENT_NAME,
      [
        {
          workspaceId: savedUser.currentWorkspace?.id,
          userWorkspaceId: savedUser.currentUserWorkspace?.id,
          userId: savedUser.id,
          userEmail: newUserWithPicture.email,
          userFirstName: newUserWithPicture.firstName,
          userLastName: newUserWithPicture.lastName,
          locale: newUserWithPicture.locale,
          serverUrl: this.twentyConfigService.get('SERVER_URL'),
          serverId: this.twentyConfigService.get('SERVER_ID'),
        },
      ],
      undefined,
    );

    void this.eventLogEmitterService
      .createContext({
        workspaceId: savedUser.currentWorkspace?.id,
        userId: savedUser.id,
      })
      .insertWorkspaceEvent(USER_SIGNUP_EVENT, {});

    void this.metricsService.incrementCounterForEvent({
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

    await this.assertWorkspaceCountWithinLimit(workspaceCount);

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

  private async assertWorkspaceCountWithinLimit(
    workspaceCount: number,
  ): Promise<void> {
    if (this.enterprisePlanService.isValid()) {
      return;
    }

    if (workspaceCount < MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY) {
      return;
    }

    throw new AuthException(
      `Cannot create more than ${MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY} workspaces without a valid enterprise key`,
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
      {
        userFriendlyMessage: msg`Workspace limit reached. A valid enterprise key is required to create more workspaces.`,
      },
    );
  }

  async signUpOnNewWorkspace(
    userData: ExistingUserOrPartialUserWithPicture['userData'],
    options?: { displayName?: string; subdomain?: string },
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

    const displayName = options?.displayName?.trim();

    if (!displayName) {
      throw new AuthException(
        'Workspace name is required',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Workspace name is required`,
        },
      );
    }

    const requestedSubdomain = options?.subdomain;

    if (isDefined(requestedSubdomain)) {
      await this.subdomainManagerService.validateSubdomainOrThrow(
        requestedSubdomain,
      );
    }

    const shouldGrantServerAdmin = !(await this.hasServerAdmin());

    const isWorkEmailFound = isWorkEmail(email);

    const workspaceId = v4();
    const workspaceCustomApplicationId = v4();

    try {
      const { user, workspace } = await this.dataSource.transaction(
        async (entityManager) => {
          const queryRunner = entityManager.queryRunner as QueryRunner;

          const workspaceToCreate = this.workspaceRepository.create({
            id: workspaceId,
            subdomain: isDefined(requestedSubdomain)
              ? requestedSubdomain
              : await this.subdomainManagerService.generateSubdomain(
                  isWorkEmailFound ? { userEmail: email } : {},
                ),
            workspaceCustomApplicationId,
            displayName,
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
            const logoUrl = `${TWENTY_ICONS_BASE_URL}/${getDomainFromEmailOrThrow(email)}`;
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
              applicationUniversalIdentifier:
                customApplication.universalIdentifier,
            },
            queryRunner,
          );

          await this.activateOnboardingForUser(
            {
              user,
              workspace,
              shouldShowConnectAccountStep: true,
            },
            queryRunner,
          );

          await this.onboardingService.setOnboardingInviteTeamPending(
            {
              workspaceId: workspace.id,
              value: true,
            },
            queryRunner,
          );

          // Click-through DPA: the DPA is incorporated by reference into the
          // ToS/signup, so acceptance = execution. Only relevant on Twenty's
          // managed cloud (multi-workspace), where Twenty is the Processor
          // hosting the data; on self-hosted deployments Twenty is not the
          // Processor, so there is nothing to record. Done atomically with
          // workspace creation so we can later prove what was agreed. (Billing
          // is an independent feature flag and must not be used to detect cloud.)
          if (
            this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED') === true
          ) {
            await queryRunner.manager.save(
              DpaAgreementEntity,
              buildDpaAgreementRecord({
                workspaceId: workspace.id,
                type: DpaAgreementType.CLICK_THROUGH,
                region:
                  this.twentyConfigService.get('DPA_DEPLOYMENT_REGION') ??
                  DEFAULT_DPA_REGION,
                acceptedAt: new Date(),
                acceptedByUserId: user.id,
                acceptedByEmail: email,
              }),
            );
          }

          return { user, workspace };
        },
      );

      void this.eventLogEmitterService
        .createContext({ workspaceId })
        .insertWorkspaceEvent(WORKSPACE_CREATED_EVENT, {});

      return { user, workspace };
    } catch (error) {
      const isSubdomainConflict =
        error instanceof QueryFailedError &&
        (error as QueryFailedErrorWithCode).code ===
          POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;

      if (isDefined(requestedSubdomain) && isSubdomainConflict) {
        throw new WorkspaceException(
          'Subdomain already taken',
          WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
        );
      }

      throw error;
    } finally {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);
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
