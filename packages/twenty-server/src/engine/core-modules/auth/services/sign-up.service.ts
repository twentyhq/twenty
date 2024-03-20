import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import FileType from 'file-type';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { assert } from 'src/utils/assert';
import {
  PASSWORD_REGEX,
  hashPassword,
} from 'src/engine/core-modules/auth/auth.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { getImageBufferFromUrl } from 'src/utils/image';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

export type SignUpServiceInput = {
  email: string;
  password?: string;
  firstName?: string | null;
  lastName?: string | null;
  workspaceInviteHash?: string | null;
  picture?: string | null;
};

@Injectable()
export class SignUpService {
  constructor(
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly httpService: HttpService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async signUp({
    email,
    workspaceInviteHash,
    password,
    firstName,
    lastName,
    picture,
  }: SignUpServiceInput) {
    if (!firstName) firstName = '';
    if (!lastName) lastName = '';

    assert(email, 'Email is required', BadRequestException);

    if (password) {
      const isPasswordValid = PASSWORD_REGEX.test(password);

      assert(isPasswordValid, 'Password too weak', BadRequestException);
    }

    const passwordHash = password ? await hashPassword(password) : undefined;

    let imagePath: string | undefined;

    if (picture) {
      imagePath = await this.uploadPicture(picture);
    }

    if (workspaceInviteHash) {
      return await this.signUpOnExistingWorkspace({
        email,
        passwordHash,
        workspaceInviteHash,
        firstName,
        lastName,
        imagePath,
      });
    } else {
      return await this.signUpOnNewWorkspace({
        email,
        passwordHash,
        firstName,
        lastName,
        imagePath,
      });
    }
  }

  private async signUpOnExistingWorkspace({
    email,
    passwordHash,
    workspaceInviteHash,
    firstName,
    lastName,
    imagePath,
  }: {
    email: string;
    passwordHash: string | undefined;
    workspaceInviteHash: string;
    firstName: string;
    lastName: string;
    imagePath: string | undefined;
  }) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: email,
      },
      relations: ['defaultWorkspace'],
    });

    const workspace = await this.workspaceRepository.findOneBy({
      inviteHash: workspaceInviteHash,
    });

    assert(
      workspace,
      'This workspace inviteHash is invalid',
      ForbiddenException,
    );

    if (existingUser) {
      const userWorkspaceExists =
        await this.userWorkspaceService.checkUserWorkspaceExists(
          existingUser.id,
          workspace.id,
        );

      if (!userWorkspaceExists) {
        await this.userWorkspaceService.create(existingUser.id, workspace.id);

        await this.userWorkspaceService.createWorkspaceMember(
          workspace.id,
          existingUser,
        );
      }

      const updatedUser = await this.userRepository.save({
        id: existingUser.id,
        defaultWorkspace: workspace,
        updatedAt: new Date().toISOString(),
      });

      return Object.assign(existingUser, updatedUser);
    }

    const userToCreate = this.userRepository.create({
      email: email,
      firstName: firstName,
      lastName: lastName,
      defaultAvatarUrl: imagePath,
      canImpersonate: false,
      passwordHash,
      defaultWorkspace: workspace,
    });

    const user = await this.userRepository.save(userToCreate);

    await this.userWorkspaceService.create(user.id, workspace.id);
    await this.userWorkspaceService.createWorkspaceMember(workspace.id, user);

    return user;
  }

  private async signUpOnNewWorkspace({
    email,
    passwordHash,
    firstName,
    lastName,
    imagePath,
  }: {
    email: string;
    passwordHash: string | undefined;
    firstName: string;
    lastName: string;
    imagePath: string | undefined;
  }) {
    const existingUser = await this.userRepository.findOne({
      where: {
        email: email,
      },
      relations: ['defaultWorkspace'],
    });

    if (existingUser) {
      assert(!existingUser, 'This user already exists', ForbiddenException);
    }

    assert(
      !this.environmentService.get('IS_SIGN_UP_DISABLED'),
      'Sign up is disabled',
      ForbiddenException,
    );

    const workspaceToCreate = this.workspaceRepository.create({
      displayName: '',
      domainName: '',
      inviteHash: v4(),
      subscriptionStatus: 'incomplete',
    });

    const workspace = await this.workspaceRepository.save(workspaceToCreate);

    const userToCreate = this.userRepository.create({
      email: email,
      firstName: firstName,
      lastName: lastName,
      defaultAvatarUrl: imagePath,
      canImpersonate: false,
      passwordHash,
      defaultWorkspace: workspace,
    });

    const user = await this.userRepository.save(userToCreate);

    await this.userWorkspaceService.create(user.id, workspace.id);

    return user;
  }

  async uploadPicture(picture: string): Promise<string> {
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

    return paths[0];
  }
}
