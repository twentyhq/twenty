import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';

import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: WorkspaceManagerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
