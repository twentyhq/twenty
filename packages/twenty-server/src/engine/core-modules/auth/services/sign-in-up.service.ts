import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import FileType from 'file-type';
import { TWENTY_ICONS_BASE_URL } from 'twenty-shared';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/engine/core-modules/auth/auth.util';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceAuthProvider } from 'src/engine/core-modules/workspace/types/workspace.type';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { getImageBufferFromUrl } from 'src/utils/image';
import { isWorkEmail } from 'src/utils/is-work-email';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';

export type SignInUpServiceInput = {
  invitation?: AppToken;
  workspace?: Workspace | null;
  existingUser?: User | null;
  billingCheckoutSessionState?: string | null;
  newUserParams?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    picture?: string | null;
    passwordHash?: string | null;
  };
} & (
  | {
      authProvider: Extract<WorkspaceAuthProvider, 'password'>;
      password: string;
    }
  | {
      authProvider: Exclude<WorkspaceAuthProvider, 'password'>;
    }
);

type UserWithPicture = {
  picture?: string;
} & Partial<User>;

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class SignInUpService {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly fileUploadService: FileUploadService,
    private readonly workspaceInvitationService: WorkspaceInvitationService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly onboardingService: OnboardingService,
    private readonly httpService: HttpService,
    private readonly environmentService: EnvironmentService,
    private readonly domainManagerService: DomainManagerService,
    private readonly userService: UserService,
  ) {}

  private async computeParamsForNewUser(
    newUserParams: SignInUpServiceInput['newUserParams'],
    password?: string,
  ) {
    if (!newUserParams) return undefined;

    if (!newUserParams.firstName) newUserParams.firstName = '';
    if (!newUserParams.lastName) newUserParams.lastName = '';

    if (!newUserParams?.email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (password) {
      newUserParams.passwordHash = await this.generateHash(password);
    }

    return newUserParams as UserWithPicture;
  }

  async signInUp(params: SignInUpServiceInput) {
    if (params.authProvider === 'password' && params.newUserParams) {
      params.newUserParams.passwordHash = await this.generateHash(
        params.password,
      );
    }

    if (params.authProvider === 'password' && params.existingUser) {
      await this.validatePassword({
        password: params.password,
        passwordHash: params.existingUser.passwordHash,
      });
    }

    if (params.workspace) {
      workspaceValidator.isAuthEnabledOrThrow(
        params.authProvider,
        params.workspace,
      );
    }

    const newUserWithPicture = await this.computeParamsForNewUser(
      params.newUserParams,
      params.authProvider === 'password' ? params.password : undefined,
    );

    // with personal invitation flow
    if (params.workspace && params.invitation) {
      return {
        workspace: params.workspace,
        user: await this.signInUpWithPersonalInvitation({
          newUserWithPicture,
          invitation: params.invitation,
          existingUser: params.existingUser,
        }),
      };
    }

    // with global invitation flow
    if (params.workspace) {
      const updatedUser = await this.signInUpOnExistingWorkspace({
        workspace: params.workspace,
        existingUser: params.existingUser,
        newUserWithPicture,
      });

      return { user: updatedUser, workspace: params.workspace };
    }

    return await this.signUpOnNewWorkspace(params.newUserParams);
  }

  private async generateHash(password: string) {
    const isPasswordValid = PASSWORD_REGEX.test(password);

    if (!isPasswordValid) {
      throw new AuthException(
        'Password too weak',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    return await hashPassword(password);
  }

  private async validatePassword({
    password,
    passwordHash,
  }: {
    password: string;
    passwordHash: string;
  }) {
    const isValid = await compareHash(
      await this.generateHash(password),
      passwordHash,
    );

    if (!isValid) {
      throw new AuthException(
        'Wrong password',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }
  }

  private async signInUpWithPersonalInvitation({
    newUserWithPicture,
    invitation,
    existingUser,
  }: {
    newUserWithPicture?: UserWithPicture;
    invitation: AppToken;
    existingUser?: User | null;
  }) {
    if (!invitation) {
      throw new AuthException(
        'Invitation not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const email = newUserWithPicture
      ? newUserWithPicture.email
      : existingUser?.email;

    if (!email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const invitationValidation =
      await this.workspaceInvitationService.validateInvitation({
        workspacePersonalInviteToken: invitation.value,
        email,
      });

    if (!invitationValidation?.isValid) {
      throw new AuthException(
        'Invitation not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const updatedUser = await this.signInUpOnExistingWorkspace({
      newUserWithPicture,
      workspace: invitationValidation.workspace,
      existingUser,
    });

    await this.workspaceInvitationService.invalidateWorkspaceInvitation(
      invitationValidation.workspace.id,
      email,
    );

    return updatedUser;
  }

  private async validateSignIn({
    user,
    workspace,
    authProvider,
  }: {
    user: User;
    workspace: Workspace;
    authProvider: SignInUpServiceInput['authProvider'];
  }) {
    await this.userService.hasUserAccessToWorkspaceOrThrow(
      user.id,
      workspace.id,
    );

    return { user, workspace };
  }

  private async persistNewUser(newUser: UserWithPicture, workspace: Workspace) {
    const imagePath = await this.uploadPicture(newUser.picture, workspace.id);

    delete newUser.picture;

    const userToCreate = this.userRepository.create({
      ...newUser,
      defaultAvatarUrl: imagePath,
      canImpersonate: false,
    } as Partial<User>);

    return await this.userRepository.save(userToCreate);
  }

  async signInUpOnExistingWorkspace({
    newUserWithPicture,
    workspace,
    existingUser,
  }: {
    newUserWithPicture?: UserWithPicture;
    workspace: Workspace;
    existingUser?: User | null;
  }) {
    workspaceValidator.assertIsActive(
      workspace,
      new AuthException(
        'Workspace is not ready to welcome new members',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );

    const user = newUserWithPicture
      ? await this.persistNewUser(newUserWithPicture, workspace)
      : existingUser;

    // should never happen - for type only
    userValidator.assertIsDefinedOrThrow(user);

    const updatedUser = await this.userWorkspaceService.addUserToWorkspace(
      user,
      workspace,
    );

    await this.activateOnboardingForUser(user, workspace, updatedUser);

    return Object.assign(user, updatedUser);
  }

  private async activateOnboardingForUser(
    user: User,
    workspace: Workspace,
    { firstName, lastName }: { firstName: string; lastName: string },
  ) {
    await this.onboardingService.setOnboardingConnectAccountPending({
      userId: user.id,
      workspaceId: workspace.id,
      value: true,
    });

    if (firstName === '' && lastName === '') {
      await this.onboardingService.setOnboardingCreateProfilePending({
        userId: user.id,
        workspaceId: workspace.id,
        value: true,
      });
    }
  }

  async signUpOnNewWorkspace(newUserParams) {
    const user: Partial<User> = {
      ...newUserParams,
      canImpersonate: false,
    };

    if (!user.email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (!this.environmentService.get('IS_MULTIWORKSPACE_ENABLED')) {
      const workspacesCount = await this.workspaceRepository.count();

      // if the workspace doesn't exist it means it's the first user of the workspace
      user.canImpersonate = true;

      // let the creation of the first workspace
      if (workspacesCount > 0) {
        throw new AuthException(
          'New workspace setup is disabled',
          AuthExceptionCode.SIGNUP_DISABLED,
        );
      }
    }

    const logoUrl = `${TWENTY_ICONS_BASE_URL}/${getDomainNameByEmail(newUserParams?.email)}`;
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

    const logo =
      isWorkEmail(newUserParams.email) && (await isLogoUrlValid())
        ? logoUrl
        : undefined;

    const workspaceToCreate = this.workspaceRepository.create({
      subdomain: await this.domainManagerService.generateSubdomain(),
      displayName: '',
      domainName: '',
      inviteHash: v4(),
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      logo,
    });

    const workspace = await this.workspaceRepository.save(workspaceToCreate);

    user.defaultAvatarUrl = await this.uploadPicture(
      newUserParams.picture,
      workspace.id,
    );

    const userCreated = this.userRepository.create(user);

    const newUser = await this.userRepository.save(userCreated);

    await this.userWorkspaceService.create(newUser.id, workspace.id);

    await this.activateOnboardingForUser(newUser, workspace, newUserParams);

    await this.onboardingService.setOnboardingInviteTeamPending({
      workspaceId: workspace.id,
      value: true,
    });

    return { user: newUser, workspace };
  }

  async uploadPicture(
    picture: string | null | undefined,
    workspaceId: string,
  ): Promise<string | undefined> {
    if (!picture) {
      return;
    }

    const buffer = await getImageBufferFromUrl(
      picture,
      this.httpService.axiosRef,
    );

    const type = await FileType.fromBuffer(buffer);

    const { paths } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename: `${v4()}.${type?.ext}`,
      mimeType: type?.mime,
      fileFolder: FileFolder.ProfilePicture,
      workspaceId,
    });

    return paths[0];
  }
}
