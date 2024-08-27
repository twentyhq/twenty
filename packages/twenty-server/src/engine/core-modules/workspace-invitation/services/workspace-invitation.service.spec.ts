import { Test, TestingModule } from '@nestjs/testing';

import { WorkspaceInvitationService } from './workspace-invitation.service';

import { getRepositoryToken } from '@nestjs/typeorm';

import { Invitation } from 'src/engine/core-modules/invitation/invitation.entity';

describe('InvitationService', () => {
  let service: WorkspaceInvitationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceInvitationService,
        {
          provide: getRepositoryToken(Invitation, 'core'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
