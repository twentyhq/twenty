import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import FileType from 'file-type';
import {
  TWENTY_ICONS_BASE_URL,
  WorkspaceActivationStatus,
} from 'twenty-shared';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

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
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';
import { getImageBufferFromUrl } from 'src/utils/image';
import { isWorkEmail } from 'src/utils/is-work-email';

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

  async computeParamsForNewUser(
    newUserParams: SignInUpNewUserPayload,
    authParams: AuthProviderWithPasswordType['authParams'],
  ) {
    if (!newUserParams.firstName) newUserParams.firstName = '';
    if (!newUserParams.lastName) newUserParams.lastName = '';

    if (!newUserParams?.email) {
      throw new AuthException(
        'Email is required',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (authParams.provider === 'password') {
      newUserParams.passwordHash = await this.generateHash(authParams.password);
    }

    return newUserParams as PartialUserWithPicture;
  }

  async signInUp(
    params: SignInUpBaseParams &
      ExistingUserOrPartialUserWithPicture &
      AuthProviderWithPasswordType,
  ) {
    // with personal invitation flow
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

    if (params.userData.type === 'newUserWithPicture') {
      return await this.signUpOnNewWorkspace(
        params.userData.newUserWithPicture,
      );
    }

    // should never happen.
    throw new Error('Invalid sign in up params');
  }

  async generateHash(password: string) {
    const isPasswordValid = PASSWORD_REGEX.test(password);

    if (!isPasswordValid) {
      throw new AuthException(
        'Password too weak',
        AuthExceptionCode.INVALID_INPUT,
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
      );
    }

    const invitationValidation =
      await this.workspaceInvitationService.validateInvitation({
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

  private async persistNewUser(
    newUser: PartialUserWithPicture,
    workspace: Workspace,
  ) {
    const imagePath = await this.uploadPicture(newUser.picture, workspace.id);

    delete newUser.picture;

    const userToCreate = this.userRepository.create({
      ...newUser,
      defaultAvatarUrl: imagePath,
      canImpersonate: false,
    } as Partial<User>);

    return await this.userRepository.save(userToCreate);
  }

  async signInUpOnExistingWorkspace(
    params: {
      workspace: Workspace;
    } & ExistingUserOrPartialUserWithPicture,
  ) {
    workspaceValidator.assertIsActive(
      params.workspace,
      new AuthException(
        'Workspace is not ready to welcome new members',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      ),
    );

    const currentUser =
      params.userData.type === 'newUserWithPicture'
        ? await this.persistNewUser(
            params.userData.newUserWithPicture,
            params.workspace,
          )
        : params.userData.existingUser;

    const updatedUser = await this.userWorkspaceService.addUserToWorkspace(
      currentUser,
      params.workspace,
    );

    const user = Object.assign(currentUser, updatedUser);

    if (params.userData.type === 'newUserWithPicture') {
      await this.activateOnboardingForUser(user, params.workspace);
    }

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

  async signUpOnNewWorkspace(partialUserWithPicture: PartialUserWithPicture) {
    const user: PartialUserWithPicture = {
      ...partialUserWithPicture,
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

    const logoUrl = `${TWENTY_ICONS_BASE_URL}/${getDomainNameByEmail(user.email)}`;
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
      isWorkEmail(user.email) && (await isLogoUrlValid()) ? logoUrl : undefined;

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
      partialUserWithPicture.picture,
      workspace.id,
    );

    const userCreated = this.userRepository.create(user);

    const newUser = await this.userRepository.save(userCreated);

    await this.userWorkspaceService.create(newUser.id, workspace.id);

    await this.activateOnboardingForUser(newUser, workspace);

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
