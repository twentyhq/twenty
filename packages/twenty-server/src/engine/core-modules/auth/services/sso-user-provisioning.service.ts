import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomBytes } from 'crypto';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { hashPassword } from 'src/engine/core-modules/auth/auth.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export type SsoProvisionResult = {
  user: UserEntity;
  workspace: WorkspaceEntity;
};

@Injectable()
export class SsoUserProvisioningService {
  private readonly logger = new Logger(SsoUserProvisioningService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    // SSO provisioning targets the core schema directly — workspace
    // repositories aren't usable here because the workspace schema may
    // not exist yet on first sign-in.
    // oxlint-disable-next-line twenty/inject-workspace-repository
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async findOrProvision(email: string): Promise<SsoProvisionResult> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new AuthException(
        'Invalid email for SSO provisioning',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const subdomain = this.twentyConfigService.get('SMB_NAME');

    if (!subdomain) {
      throw new AuthException(
        'SMB_NAME not configured',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { subdomain },
    });

    if (!workspace) {
      this.logger.error(
        `SSO landing workspace (subdomain="${subdomain}") missing — the seeder should have created it from SMB_NAME on first init.`,
      );
      throw new AuthException(
        'SSO workspace not provisioned',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const user = await this.findOrCreateUser(normalizedEmail);

    await this.userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace(
      user,
      workspace,
    );

    return { user, workspace };
  }

  private async findOrCreateUser(email: string): Promise<UserEntity> {
    const existing = await this.userRepository.findOne({ where: { email } });

    if (existing) {
      return existing;
    }

    const unguessablePassword = randomBytes(32).toString('hex');
    const passwordHash = await hashPassword(unguessablePassword);

    // The SSO IdP already vouched for this email (the only path to the
    // proxy-login route is through oauth2-proxy, which validates the
    // session). Mark the user verified at creation so SSO accounts don't
    // appear semi-verified to gates that read isEmailVerified.
    const created = this.userRepository.create({
      email,
      firstName: '',
      lastName: '',
      passwordHash,
      isEmailVerified: true,
    });

    return await this.userRepository.save(created);
  }
}
