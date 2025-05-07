import { Test, TestingModule } from '@nestjs/testing';

import {
  AuditException,
  AuditExceptionCode,
} from 'src/engine/core-modules/audit/audit.exception';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { AuditResolver } from './audit.resolver';

import { AuditService } from './services/audit.service';

describe('AuditResolver', () => {
  let resolver: AuditResolver;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    auditService = {
      createContext: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditResolver,
        {
          provide: AuditService,
          useValue: auditService,
        },
      ],
    }).compile();

    resolver = module.get<AuditResolver>(AuditResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should handle a valid pageview input', async () => {
    const mockInsertPageviewEvent = jest
      .fn()
      .mockResolvedValue('Pageview created');

    auditService.createContext.mockReturnValue({
      insertPageviewEvent: mockInsertPageviewEvent,
      insertWorkspaceEvent: jest.fn(),
      insertObjectEvent: jest.fn(),
    });

    const input = {
      type: 'pageview' as const,
      name: 'Test Page',
      properties: {},
    };
    const result = await resolver.trackAnalytics(
      input,
      { id: 'workspace-1' } as Workspace,
      { id: 'user-1' } as User,
    );

    expect(auditService.createContext).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      userId: 'user-1',
    });
    expect(mockInsertPageviewEvent).toHaveBeenCalledWith('Test Page', {});
    expect(result).toBe('Pageview created');
  });

  it('should handle a valid track input', async () => {
    const mockInsertWorkspaceEvent = jest
      .fn()
      .mockResolvedValue('Track created');

    auditService.createContext.mockReturnValue({
      insertWorkspaceEvent: mockInsertWorkspaceEvent,
      insertObjectEvent: jest.fn(),
      insertPageviewEvent: jest.fn(),
    });

    const input = {
      type: 'track' as const,
      event: 'Custom Domain Activated' as const,
      properties: {},
    };
    const result = await resolver.trackAnalytics(
      input,
      { id: 'workspace-2' } as Workspace,
      { id: 'user-2' } as User,
    );

    expect(auditService.createContext).toHaveBeenCalledWith({
      workspaceId: 'workspace-2',
      userId: 'user-2',
    });
    expect(mockInsertWorkspaceEvent).toHaveBeenCalledWith(
      'Custom Domain Activated',
      {},
    );
    expect(result).toBe('Track created');
  });

  it('should throw an AuditException for invalid input', async () => {
    const invalidInput = { type: 'invalid' };

    await expect(
      resolver.trackAnalytics(invalidInput as any, undefined, undefined),
    ).rejects.toThrowError(
      new AuditException(
        'Invalid analytics input',
        AuditExceptionCode.INVALID_TYPE,
      ),
    );
  });
});
