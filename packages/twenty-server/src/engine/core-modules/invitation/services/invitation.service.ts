import { InjectRepository } from '@nestjs/typeorm';

import { ModuleRef } from '@nestjs/core';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { Invitation } from 'src/engine/core-modules/invitation/invitation.entity';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class InvitationService extends TypeOrmQueryService<Invitation> {
  private tokenService: TokenService;
  constructor(
    @InjectRepository(Invitation, 'core')
    private readonly invitationRepository: Repository<Invitation>,
    private moduleRef: ModuleRef,
  ) {
    super(invitationRepository);
  }

  onModuleInit() {
    // not sure about this trick
    this.tokenService = this.moduleRef.get(TokenService, { strict: false });
  }

  // TODO: manage errors
  async createInvitation(email: string, workspace: Workspace) {
    const invitation = await this.invitationRepository.save({});

    await this.tokenService.generateInvitationToken(
      workspace.id,
      email,
      invitation.id,
    );
  }
}
