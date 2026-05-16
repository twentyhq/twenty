import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomBytes } from 'crypto';

import { DataSource, Repository } from 'typeorm';

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
    // Used for the advisory-lock transaction that serialises
    // concurrent first-login provisioning (see findOrCreateUser).
    private readonly dataSource: DataSource,
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
    // Concurrent-creation race guard. On first-ever SSO login the SPA
    // fires multiple parallel API requests with no session cookie set
    // yet — every request reaches the proxy-login flow, every request
    // hits the findOne→save below, and before the row is committed the
    // others have already passed the findOne miss. Without a
    // serialisation point, N parallel requests insert N duplicate rows
    // for the same email.
    //
    // We don't rely on the UserEntity unique-on-email constraint to
    // dedupe at the DB level — that surfaces as a 500 on the losers of
    // the race rather than a graceful return of the existing user. We
    // serialise the find+create on a Postgres advisory lock keyed by
    // the email hash. Advisory locks are per-session, transaction-
    // scoped, no schema cost; different emails take different lock
    // keys so concurrent first-logins for distinct users don't contend.
    return await this.dataSource.transaction(async (manager) => {
      // pg_advisory_xact_lock takes a bigint; hashtextextended returns a
      // stable bigint hash. Released automatically when the transaction
      // commits or rolls back.
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
        [email],
      );

      // Re-check inside the lock. If a concurrent request beat us to
      // the create, this returns its row and we skip provisioning.
      const userRepo = manager.getRepository(UserEntity);
      const existing = await userRepo.findOne({ where: { email } });

      if (existing) {
        return existing;
      }

      const unguessablePassword = randomBytes(32).toString('hex');
      const passwordHash = await hashPassword(unguessablePassword);

      // The SSO IdP already vouched for this email (the only path to
      // the proxy-login route is through oauth2-proxy, which validates
      // the session). Mark the user verified at creation so SSO
      // accounts don't appear semi-verified to gates that read
      // isEmailVerified.
      const created = userRepo.create({
        email,
        firstName: '',
        lastName: '',
        passwordHash,
        isEmailVerified: true,
      });

      return await userRepo.save(created);
    });
  }
}
