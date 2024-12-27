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
  compareHash,
  hashPassword,
  PASSWORD_REGEX,
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
import { isDefined } from 'src/utils/is-defined';

export type SignInUpServiceInput = {
  email: string;
  password?: string;
  firstName?: string | null;
  lastName?: string | null;
  workspaceInviteHash?: string;
  workspacePersonalInviteToken?: string;
  picture?: string | null;
  fromSSO: boolean;
  targetWorkspaceSubdomain?: string;
  authProvider?: WorkspaceAuthProvider;
};

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

  async signInUp({
    email,
    workspacePersonalInviteToken,
    workspaceInviteHash,
    password,
    firstName,
    lastName,
    picture,
    fromSSO,
    targetWorkspaceSubdomain,
    authProvider,
  }: SignInUpServiceInput) {
    if (!firstName) firstName = '';
    if (!lastName) lastName = '';

    if (!email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (password) {
      const isPasswordValid = PASSWORD_REGEX.test(password);

      if (!isPasswordValid) {
        throw new AuthException(
          'Password too weak',
          AuthExceptionCode.INVALID_INPUT,
        );
      }
    }

    const passwordHash = password ? await hashPassword(password) : undefined;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser && !fromSSO) {
      const isValid = await compareHash(
        password || '',
        existingUser.passwordHash,
      );

      if (!isValid) {
        throw new AuthException(
          'Wrong password',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }
    }

    const signInUpWithInvitationResult = await this.signInUpWithInvitation({
      email,
      workspacePersonalInviteToken,
      workspaceInviteHash,
      targetWorkspaceSubdomain,
      fromSSO,
      firstName,
      lastName,
      picture,
      authProvider,
      passwordHash,
      existingUser,
    });

    if (isDefined(signInUpWithInvitationResult)) {
      return signInUpWithInvitationResult;
    }

    if (!existingUser) {
      return await this.signUpOnNewWorkspace({
        email,
        passwordHash,
        firstName,
        lastName,
        picture,
      });
    }

    const workspace =
      await this.domainManagerService.getWorkspaceBySubdomainOrDefaultWorkspace(
        targetWorkspaceSubdomain,
      );

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    return await this.validateSignIn({
      user: existingUser,
      workspace,
      authProvider,
    });
  }

  private async signInUpWithInvitation({
    email,
    workspacePersonalInviteToken,
    workspaceInviteHash,
    firstName,
    lastName,
    picture,
    fromSSO,
    targetWorkspaceSubdomain,
    authProvider,
    passwordHash,
    existingUser,
  }: {
    email: string;
    workspacePersonalInviteToken?: string;
    workspaceInviteHash?: string;
    firstName: string;
    lastName: string;
    picture?: string | null;
    authProvider?: WorkspaceAuthProvider;
    passwordHash?: string;
    existingUser: User | null;
    fromSSO: boolean;
    targetWorkspaceSubdomain?: string;
  }) {
    const maybeInvitation =
      fromSSO && !workspacePersonalInviteToken && !workspaceInviteHash
        ? await this.workspaceInvitationService.findInvitationByWorkspaceSubdomainAndUserEmail(
            {
              subdomain: targetWorkspaceSubdomain,
              email,
            },
          )
        : undefined;

    const invitationValidation =
      workspacePersonalInviteToken || workspaceInviteHash || maybeInvitation
        ? await this.workspaceInvitationService.validateInvitation({
            workspacePersonalInviteToken:
              workspacePersonalInviteToken ?? maybeInvitation?.value,
            workspaceInviteHash,
            email,
          })
        : null;

    if (
      invitationValidation?.isValid === true &&
      invitationValidation.workspace
    ) {
      const updatedUser = await this.signInUpOnExistingWorkspace({
        email,
        passwordHash,
        workspace: invitationValidation.workspace,
        firstName,
        lastName,
        picture,
        existingUser,
        authProvider,
      });

      await this.workspaceInvitationService.invalidateWorkspaceInvitation(
        invitationValidation.workspace.id,
        email,
      );

      return {
        user: updatedUser,
        workspace: invitationValidation.workspace,
      };
    }
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
    if (authProvider) {
      workspaceValidator.isAuthEnabledOrThrow(authProvider, workspace);
    }

    await this.userService.hasUserAccessToWorkspaceOrThrow(
      user.id,
      workspace.id,
    );

    return { user, workspace };
  }

  async signInUpOnExistingWorkspace({
    email,
    passwordHash,
    workspace,
    firstName,
    lastName,
    picture,
    existingUser,
    authProvider,
  }: {
    email: string;
    passwordHash: string | undefined;
    workspace: Workspace;
    firstName: string;
    lastName: string;
    picture: SignInUpServiceInput['picture'];
    existingUser: User | null;
    authProvider?: WorkspaceAuthProvider;
  }) {
    const isNewUser = !isDefined(existingUser);
    let user = existingUser;

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );

    workspaceValidator.assertIsActive(
      workspace,
      new AuthException(
        'Workspace is not ready to welcome new members',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );

    if (authProvider) {
      workspaceValidator.isAuthEnabledOrThrow(authProvider, workspace);
    }

    if (isNewUser) {
      const imagePath = await this.uploadPicture(picture, workspace.id);

      const userToCreate = this.userRepository.create({
        email: email,
        firstName: firstName,
        lastName: lastName,
        defaultAvatarUrl: imagePath,
        canImpersonate: false,
        passwordHash,
      });

      user = await this.userRepository.save(userToCreate);
    }

    userValidator.assertIsDefinedOrThrow(
      user,
      new AuthException(
        'User not found',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );

    const updatedUser = await this.userWorkspaceService.addUserToWorkspace(
      user,
      workspace,
    );

    await this.activateOnboardingForUser(user, workspace, {
      firstName,
      lastName,
    });

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

  async signUpOnNewWorkspace({
    email,
    passwordHash,
    firstName,
    lastName,
    picture,
  }: {
    email: string;
    passwordHash: string | undefined;
    firstName: string;
    lastName: string;
    picture: SignInUpServiceInput['picture'];
  }) {
    const user: Partial<User> = {
      email,
      firstName,
      lastName,
      canImpersonate: false,
      passwordHash,
    };

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

    const logo = isWorkEmail(email)
      ? `${TWENTY_ICONS_BASE_URL}/${getDomainNameByEmail(email)}`
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

    user.defaultAvatarUrl = await this.uploadPicture(picture, workspace.id);

    const userCreated = this.userRepository.create(user);

    const newUser = await this.userRepository.save(userCreated);

    await this.userWorkspaceService.create(newUser.id, workspace.id);

    await this.activateOnboardingForUser(newUser, workspace, {
      firstName,
      lastName,
    });

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
