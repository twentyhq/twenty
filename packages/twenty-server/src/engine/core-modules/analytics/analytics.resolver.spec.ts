import { Test, TestingModule } from '@nestjs/testing';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import {
  AnalyticsException,
  AnalyticsExceptionCode,
} from 'src/engine/core-modules/analytics/analytics.exception';

import { AnalyticsResolver } from './analytics.resolver';

import { AnalyticsService } from './services/analytics.service';

describe('AnalyticsResolver', () => {
  let resolver: AnalyticsResolver;
  let analyticsService: jest.Mocked<AnalyticsService>;

  beforeEach(async () => {
    analyticsService = {
      createAnalyticsContext: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsResolver,
        {
          provide: AnalyticsService,
          useValue: analyticsService,
        },
      ],
    }).compile();

    resolver = module.get<AnalyticsResolver>(AnalyticsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should handle a valid pageview input', async () => {
    const mockPageview = jest.fn().mockResolvedValue('Pageview created');

    analyticsService.createAnalyticsContext.mockReturnValue({
      pageview: mockPageview,
      track: jest.fn(),
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

    expect(analyticsService.createAnalyticsContext).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      userId: 'user-1',
    });
    expect(mockPageview).toHaveBeenCalledWith('Test Page', {});
    expect(result).toBe('Pageview created');
  });

  it('should handle a valid track input', async () => {
    const mockTrack = jest.fn().mockResolvedValue('Track created');

    analyticsService.createAnalyticsContext.mockReturnValue({
      track: mockTrack,
      pageview: jest.fn(),
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

    expect(analyticsService.createAnalyticsContext).toHaveBeenCalledWith({
      workspaceId: 'workspace-2',
      userId: 'user-2',
    });
    expect(mockTrack).toHaveBeenCalledWith('Custom Domain Activated', {});
    expect(result).toBe('Track created');
  });

  it('should throw an AnalyticsException for invalid input', async () => {
    const invalidInput = { type: 'invalid' };

    await expect(
      resolver.trackAnalytics(invalidInput as any, undefined, undefined),
    ).rejects.toThrowError(
      new AnalyticsException(
        'Invalid analytics input',
        AnalyticsExceptionCode.INVALID_TYPE,
      ),
    );
  });
});
