import { Test, type TestingModule } from '@nestjs/testing';

import { type EntityManager } from 'typeorm';
import { CalendarChannelVisibility } from 'twenty-shared/types';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

// Same as `create-message-channel.service.spec.ts`: this fallback is the effective setting
// for the connection paths that send no visibility.
describe('CreateCalendarChannelService', () => {
  let service: CreateCalendarChannelService;

  const save = jest.fn();
  const mockTransactionManager = {
    getRepository: jest.fn().mockReturnValue({ save }),
  } as unknown as EntityManager;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCalendarChannelService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn((callback) => callback()),
          },
        },
      ],
    }).compile();

    service = module.get<CreateCalendarChannelService>(
      CreateCalendarChannelService,
    );
  });

  const createCalendarChannel = (
    calendarVisibility?: CalendarChannelVisibility,
  ) =>
    service.createCalendarChannel({
      workspaceId: 'workspace-id',
      connectedAccountId: 'connected-account-id',
      handle: 'tim@apple.dev',
      calendarVisibility,
      transactionManager: mockTransactionManager,
    });

  it('should default to METADATA when no visibility is requested', async () => {
    await createCalendarChannel();

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: CalendarChannelVisibility.METADATA,
      }),
    );
  });

  it('should keep an explicit SHARE_EVERYTHING', async () => {
    await createCalendarChannel(CalendarChannelVisibility.SHARE_EVERYTHING);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      }),
    );
  });
});
