import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Request } from 'express';

import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { IMPERSONATION_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/impersonation/impersonation';
import { ImpersonationService } from 'src/engine/core-modules/impersonation/services/impersonation.service';
import { type ImpersonationLevel } from 'src/engine/core-modules/impersonation/types/impersonation-level.type';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

const IMPERSONATION_LEVELS: ImpersonationLevel[] = ['server', 'workspace'];
const IMPERSONATOR_USER_WORKSPACE_ID = 'impersonator-user-workspace-id';

const createImpersonationService = async () => {
  const insertWorkspaceEvent = jest.fn();

  const testingModule = await Test.createTestingModule({
    providers: [
      ImpersonationService,
      {
        provide: getRepositoryToken(UserWorkspaceEntity),
        useValue: {
          findOne: jest.fn().mockResolvedValue({
            id: IMPERSONATOR_USER_WORKSPACE_ID,
            userId: 'impersonator-user-id',
          }),
        },
      },
      {
        provide: EventLogEmitterService,
        useValue: {
          createContext: jest.fn().mockReturnValue({ insertWorkspaceEvent }),
        },
      },
      {
        provide: UserSessionCookieService,
        useValue: { extractSessionTokenFromRequest: jest.fn() },
      },
    ],
  })
    .useMocker(() => ({}))
    .compile();

  return {
    impersonationService: testingModule.get(ImpersonationService),
    insertWorkspaceEvent,
  };
};

describe('ImpersonationService.stopImpersonation', () => {
  it.each(IMPERSONATION_LEVELS)(
    'should log the ended event at %s level',
    async (level) => {
      const { impersonationService, insertWorkspaceEvent } =
        await createImpersonationService();

      await impersonationService.stopImpersonation({
        impersonationContext: {
          impersonatorUserWorkspaceId: IMPERSONATOR_USER_WORKSPACE_ID,
          level,
        },
        workspaceId: 'workspace-id',
        request: {} as Request,
      });

      expect(insertWorkspaceEvent).toHaveBeenCalledWith(
        IMPERSONATION_EVENT,
        expect.objectContaining({ level, action: 'ended' }),
      );
    },
  );
});
