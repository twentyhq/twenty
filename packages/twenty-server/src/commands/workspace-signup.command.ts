// nestbox: added workspace signup command business logic
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { Repository } from 'typeorm';

import { hashPassword } from 'src/engine/core-modules/auth/auth.util';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

interface WorkspaceSignupOptions {
  username: string;
  password: string;
  workspaceName: string;
  timezone?: string;
  adminFirstName: string;
  adminLastName: string;
  locale?: string;
}

@Command({
  name: 'workspace:signup',
  description: 'Create a new workspace with admin user setup',
})
@Injectable()
export class WorkspaceSignupCommand extends CommandRunner {
  private readonly logger = new Logger(WorkspaceSignupCommand.name);

  constructor(
    private readonly signInUpService: SignInUpService,
    // Removed AuthService since it's not being used
    private readonly workspaceService: WorkspaceService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    super();
  }

  @Option({
    flags: '-u, --username <username>',
    description: 'Admin user email/username',
    required: true,
  })
  parseUsername(value: string): string {
    return value;
  }

  @Option({
    flags: '-p, --password <password>',
    description: 'Admin user password',
    required: true,
  })
  parsePassword(value: string): string {
    return value;
  }

  @Option({
    flags: '-w, --workspace-name <workspaceName>',
    description: 'Workspace display name',
    required: true,
  })
  parseWorkspaceName(value: string): string {
    return value;
  }

  @Option({
    flags: '-t, --timezone [timezone]',
    description: 'Timezone (default: America/New_York)',
    required: false,
  })
  parseTimezone(value: string): string {
    return value || 'America/New_York';
  }

  @Option({
    flags: '-f, --admin-first-name <adminFirstName>',
    description: 'Admin user first name',
    required: true,
  })
  parseAdminFirstName(value: string): string {
    return value;
  }

  @Option({
    flags: '-l, --admin-last-name <adminLastName>',
    description: 'Admin user last name',
    required: true,
  })
  parseAdminLastName(value: string): string {
    return value;
  }

  @Option({
    flags: '--locale [locale]',
    description: 'User locale (default: en)',
    required: false,
  })
  parseLocale(value: string): string {
    return value || 'en';
  }

  async run(
    passedParams: string[],
    options: WorkspaceSignupOptions,
  ): Promise<void> {
    try {
      this.logger.log('Starting workspace signup process...');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(options.username)) {
        throw new Error('Invalid email format for username');
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: options.username },
      });

      if (existingUser) {
        throw new Error(`User with email ${options.username} already exists`);
      }

      // Validate password strength (basic validation)
      if (options.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      this.logger.log(`Creating workspace: ${options.workspaceName}`);
      this.logger.log(`Setting up admin user: ${options.username}`);

      // Create new user with admin privileges
      const passwordHash = await hashPassword(options.password);

      const newUserData = {
        email: options.username,
        firstName: options.adminFirstName,
        lastName: options.adminLastName,
        passwordHash,
        locale: options.locale,
      };

      // Use the existing signUpOnNewWorkspace method
      const { user, workspace } =
        await this.signInUpService.signUpOnNewWorkspace({
          type: 'newUserWithPicture',
          newUserWithPicture: newUserData,
        });

      this.logger.log(`Workspace created with ID: ${workspace.id}`);
      this.logger.log(`User created with ID: ${user.id}`);

      // Activate the workspace
      const activatedWorkspace = await this.workspaceService.activateWorkspace(
        user,
        workspace,
        {
          displayName: options.workspaceName,
        },
      );

      if (!activatedWorkspace) {
        throw new Error('Failed to activate workspace');
      }

      this.logger.log(`Workspace activated successfully`);

      // Generate workspace URLs
      const workspaceUrls =
        this.domainManagerService.getWorkspaceUrls(activatedWorkspace);

      // Output confirmation
      this.logger.log('='.repeat(60));
      this.logger.log('WORKSPACE CREATION SUCCESSFUL');
      this.logger.log('='.repeat(60));
      this.logger.log(`Workspace ID: ${activatedWorkspace.id}`);
      this.logger.log(`Workspace Name: ${activatedWorkspace.displayName}`);
      this.logger.log(`Workspace Subdomain: ${activatedWorkspace.subdomain}`);
      this.logger.log(`Workspace URL: ${workspaceUrls.subdomainUrl}`);
      this.logger.log(
        `Activation Status: ${activatedWorkspace.activationStatus}`,
      );
      this.logger.log('');
      this.logger.log('ADMIN USER SETUP CONFIRMED');
      this.logger.log('='.repeat(60));
      this.logger.log(`Admin User ID: ${user.id}`);
      this.logger.log(`Admin Email: ${user.email}`);
      this.logger.log(`Admin First Name: ${user.firstName}`);
      this.logger.log(`Admin Last Name: ${user.lastName}`);
      this.logger.log(`Can Impersonate: ${user.canImpersonate}`);
      this.logger.log(
        `Can Access Full Admin Panel: ${user.canAccessFullAdminPanel}`,
      );
      this.logger.log(`Email Verified: ${user.isEmailVerified}`);
      this.logger.log('');
      this.logger.log('Workspace is ready for use!');
      this.logger.log('='.repeat(60));
    } catch (error) {
      this.logger.error('Failed to create workspace:', error.message);
      throw error;
    }
  }
}
