import { Test, TestingModule } from '@nestjs/testing';

import { InvitationService } from './invitation.service';

import { getRepositoryToken } from '@nestjs/typeorm';

import { Invitation } from 'src/engine/core-modules/invitation/invitation.entity';

describe('InvitationService', () => {
  let service: InvitationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        {
          provide: getRepositoryToken(Invitation, 'core'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
