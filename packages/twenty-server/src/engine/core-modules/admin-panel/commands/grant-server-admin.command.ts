import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

type GrantServerAdminCommandOptions = {
  email: string;
};

@Command({
  name: 'server-admin:grant',
  description:
    'Grant full Admin Panel access and impersonation to a user, e.g. to recover an instance left without a server admin',
})
export class GrantServerAdminCommand extends CommandRunner {
  private readonly logger = new Logger(GrantServerAdminCommand.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {
    super();
  }

  @Option({
    flags: '-e, --email <email>',
    description: 'Email of the user to make a server admin',
    required: true,
  })
  parseEmail(value: string): string {
    return value.trim();
  }

  async run(
    _passedParams: string[],
    options: GrantServerAdminCommandOptions,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: options.email },
    });

    if (!isDefined(user)) {
      throw new Error(`No active user found with email ${options.email}`);
    }

    if (user.canAccessFullAdminPanel && user.canImpersonate) {
      this.logger.log(`${user.email} is already a server admin`);

      return;
    }

    await this.userRepository.update(
      { id: user.id },
      { canAccessFullAdminPanel: true, canImpersonate: true },
    );

    await this.coreEntityCacheService.invalidate('user', user.id);

    this.logger.log(`Granted server admin access to ${user.email}`);
  }
}
