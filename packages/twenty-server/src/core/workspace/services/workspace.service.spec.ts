import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Workspace } from 'src/core/workspace/workspace.entity';
import { WorkspaceManagerService } from 'src/workspace/workspace-manager/workspace-manager.service';
import { UserWorkspace } from 'src/core/user-workspace/user-workspace.entity';
import { BillingService } from 'src/core/billing/billing.service';
import { UserWorkspaceService } from 'src/core/user-workspace/user-workspace.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { User } from 'src/core/user/user.entity';

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
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: WorkspaceManagerService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: BillingService,
          useValue: {},
        },
        {
          provide: DataSourceService,
          useValue: {},
        },
        {
          provide: TypeORMService,
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
