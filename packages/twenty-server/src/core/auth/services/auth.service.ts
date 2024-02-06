import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';

import FileType from 'file-type';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { render } from '@react-email/components';
import { PasswordUpdateNotifyEmail } from 'twenty-emails';

import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';

import { ChallengeInput } from 'src/core/auth/dto/challenge.input';
import { assert } from 'src/utils/assert';
import {
  PASSWORD_REGEX,
  compareHash,
  hashPassword,
} from 'src/core/auth/auth.util';
import { Verify } from 'src/core/auth/dto/verify.entity';
import { UserExists } from 'src/core/auth/dto/user-exists.entity';
import { WorkspaceInviteHashValid } from 'src/core/auth/dto/workspace-invite-hash-valid.entity';
import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { UserService } from 'src/core/user/services/user.service';
import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';
import { getImageBufferFromUrl } from 'src/utils/image';
import { FileUploadService } from 'src/core/file/services/file-upload.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { EmailService } from 'src/integrations/email/email.service';
import { UpdatePassword } from 'src/core/auth/dto/update-password.entity';

import { TokenService } from './token.service';

export type UserPayload = {
  firstName: string;
  lastName: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly httpService: HttpService,
    private readonly environmentService: EnvironmentService,
    private readonly emailService: EmailService,
  ) {}

  async challenge(challengeInput: ChallengeInput) {
    const user = await this.userRepository.findOneBy({
      email: challengeInput.email,
    });

    assert(user, "This user doesn't exist", NotFoundException);
    assert(user.passwordHash, 'Incorrect login method', ForbiddenException);

    const isValid = await compareHash(
      challengeInput.password,
      user.passwordHash,
    );

    assert(isValid, 'Wrong password', ForbiddenException);

    return user;
  }

  async signUp({
    email,
    password,
    workspaceInviteHash,
    firstName,
    lastName,
    picture,
  }: {
    email: string;
    password?: string;
    firstName?: string | null;
    lastName?: string | null;
    workspaceInviteHash?: string | null;
    picture?: string | null;
  }) {
    if (!firstName) firstName = '';
    if (!lastName) lastName = '';

    const existingUser = await this.userRepository.findOneBy({
      email: email,
    });

    assert(!existingUser, 'This user already exists', ForbiddenException);

    if (password) {
      const isPasswordValid = PASSWORD_REGEX.test(password);

      assert(isPasswordValid, 'Password too weak', BadRequestException);
    }

    const passwordHash = password ? await hashPassword(password) : undefined;
    let workspace: Workspace | null;

    if (workspaceInviteHash) {
      workspace = await this.workspaceRepository.findOneBy({
        inviteHash: workspaceInviteHash,
      });

      assert(
        workspace,
        'This workspace inviteHash is invalid',
        ForbiddenException,
      );
    } else {
      assert(
        !this.environmentService.isSignUpDisabled(),
        'Sign up is disabled',
        ForbiddenException,
      );

      const workspaceToCreate = this.workspaceRepository.create({
        displayName: '',
        domainName: '',
        inviteHash: v4(),
        subscriptionStatus: 'incomplete',
      });

      workspace = await this.workspaceRepository.save(workspaceToCreate);
      await this.workspaceManagerService.init(workspace.id);
    }

    const userToCreate = this.userRepository.create({
      email: email,
      firstName: firstName,
      lastName: lastName,
      canImpersonate: false,
      passwordHash,
      defaultWorkspace: workspace,
    });
    const user = await this.userRepository.save(userToCreate);
    let imagePath: string | undefined = undefined;

    if (picture) {
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
      });

      imagePath = paths[0];
    }
    await this.userService.createWorkspaceMember(user, imagePath);

    return user;
  }

  async verify(email: string): Promise<Verify> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: ['defaultWorkspace'],
    });

    assert(user, "This user doesn't exist", NotFoundException);

    assert(
      user.defaultWorkspace,
      'User has no default workspace',
      NotFoundException,
    );

    // passwordHash is hidden for security reasons
    user.passwordHash = '';
    user.workspaceMember = await this.userService.loadWorkspaceMember(user);

    const accessToken = await this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async checkUserExists(email: string): Promise<UserExists> {
    const user = await this.userRepository.findOneBy({
      email,
    });

    return { exists: !!user };
  }

  async checkWorkspaceInviteHashIsValid(
    inviteHash: string,
  ): Promise<WorkspaceInviteHashValid> {
    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash,
    });

    return { isValid: !!workspace };
  }

  async impersonate(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['defaultWorkspace'],
    });

    assert(user, "This user doesn't exist", NotFoundException);

    if (!user.defaultWorkspace.allowImpersonation) {
      throw new ForbiddenException('Impersonation not allowed');
    }

    const accessToken = await this.tokenService.generateAccessToken(user.id);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<UpdatePassword> {
    const user = await this.userRepository.findOneBy({ id: userId });

    assert(user, 'User not found', NotFoundException);

    const isPasswordValid = PASSWORD_REGEX.test(newPassword);

    assert(isPasswordValid, 'Password too weak', BadRequestException);

    const newPasswordHash = await hashPassword(newPassword);

    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });

    const emailTemplate = PasswordUpdateNotifyEmail({
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      link: this.environmentService.getFrontBaseUrl(),
    });

    const html = render(emailTemplate, {
      pretty: true,
    });
    const text = render(emailTemplate, {
      plainText: true,
    });

    this.emailService.send({
      from: `${this.environmentService.getEmailFromName()} <${this.environmentService.getEmailFromAddress()}>`,
      to: user.email,
      subject: 'Your Password Has Been Successfully Changed',
      text,
      html,
    });

    return { success: true };
  }
}
