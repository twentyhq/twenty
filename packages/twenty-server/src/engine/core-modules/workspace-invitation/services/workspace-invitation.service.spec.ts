import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';

import { WorkspaceInvitationService } from './workspace-invitation.service';

describe('WorkspaceInvitationService', () => {
  let service: WorkspaceInvitationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceInvitationService,
        {
          provide: getRepositoryToken(AppToken, 'core'),
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
