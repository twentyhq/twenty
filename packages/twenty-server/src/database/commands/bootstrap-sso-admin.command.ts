import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomBytes } from 'crypto';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { hashPassword } from 'src/engine/core-modules/auth/auth.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

type BootstrapSsoAdminOptions = {
  email: string;
};

// Pre-seed one Admin user for the SMB_NAME workspace so SSO sign-in lands a
// useful role on first hit. Mirrors `provision-plane.sh` (ADMIN_EMAIL →
// InstanceAdmin). Idempotent: subsequent runs find the existing user/
// userWorkspace and no-op.
//
// Wired into the foss-server-bundle-devstack provisioning pipeline at
// `provision/provision-twenty.sh`, which runs `workspace:seed:dev --light`
// (creates the SMB_NAME workspace + standard roles) and then this command.
// Both steps are idempotent on re-runs.
@Command({
  name: 'workspace:bootstrap-sso-admin',
  description:
    'Pre-seed a Cognito-known email as the Admin user of the SMB_NAME workspace. Run once after `workspace:seed:dev --light` (see foss-server-bundle-devstack/provision/provision-twenty.sh).',
})
export class BootstrapSsoAdminCommand extends CommandRunner {
  private readonly logger = new Logger(BootstrapSsoAdminCommand.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super();
  }

  @Option({
    flags: '-e, --email <email>',
    description: 'Email of the Cognito user to bootstrap as Admin.',
    required: true,
  })
  parseEmail(value: string): string {
    return value;
  }

  async run(
    _passedParams: string[],
    options: BootstrapSsoAdminOptions,
  ): Promise<void> {
    const subdomain = this.twentyConfigService.get('SMB_NAME');

    if (!subdomain) {
      throw new Error('SMB_NAME is not configured — refusing to bootstrap.');
    }

    const normalizedEmail = options.email.trim().toLowerCase();

    if (!normalizedEmail.includes('@')) {
      throw new Error(
        `Invalid email "${options.email}" — must contain an @-sign.`,
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { subdomain },
    });

    if (!workspace) {
      throw new Error(
        `Workspace with subdomain="${subdomain}" not found. Run \`workspace:seed:dev --light\` first.`,
      );
    }

    const adminRole = await this.roleRepository.findOne({
      where: {
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
        workspaceId: workspace.id,
      },
    });

    if (!adminRole) {
      throw new Error(
        `Admin role missing in workspace "${subdomain}". Standard application sync must have been skipped.`,
      );
    }

    const user = await this.findOrCreateUser(normalizedEmail);

    await this.userWorkspaceService.addUserToWorkspaceIfUserNotInWorkspace(
      user,
      workspace,
      adminRole.id,
    );

    this.logger.log(
      `Admin user "${normalizedEmail}" provisioned for workspace "${subdomain}".`,
    );
  }

  private async findOrCreateUser(email: string): Promise<UserEntity> {
    const existing = await this.userRepository.findOne({ where: { email } });

    if (existing) {
      return existing;
    }

    const passwordHash = await hashPassword(randomBytes(32).toString('hex'));

    return await this.userRepository.save(
      this.userRepository.create({
        email,
        firstName: '',
        lastName: '',
        passwordHash,
        isEmailVerified: true,
      }),
    );
  }
}
