import { Test } from '@nestjs/testing';

import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { IMPERSONATION_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/impersonation/impersonation';
import { type ImpersonationLevel } from 'src/engine/core-modules/impersonation/types/impersonation-level.type';

const IMPERSONATION_LEVELS: ImpersonationLevel[] = ['server', 'workspace'];

const createAuthService = async () => {
  const insertWorkspaceEvent = jest.fn();

  const testingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: AccessTokenService,
        useValue: { generateAccessToken: jest.fn() },
      },
      {
        provide: RefreshTokenService,
        useValue: { generateRefreshToken: jest.fn() },
      },
      {
        provide: EventLogEmitterService,
        useValue: {
          createContext: jest.fn().mockReturnValue({ insertWorkspaceEvent }),
        },
      },
    ],
  })
    .useMocker(() => ({}))
    .compile();

  return { authService: testingModule.get(AuthService), insertWorkspaceEvent };
};

describe('AuthService.generateImpersonationAccessTokenAndRefreshToken', () => {
  it.each(IMPERSONATION_LEVELS)(
    'should log the attempted and issued events at %s level',
    async (impersonationLevel) => {
      const { authService, insertWorkspaceEvent } = await createAuthService();

      await authService.generateImpersonationAccessTokenAndRefreshToken({
        workspaceId: 'workspace-id',
        impersonatorUserWorkspaceId: 'impersonator-user-workspace-id',
        impersonatedUserWorkspaceId: 'impersonated-user-workspace-id',
        _impersonatorUserId: 'impersonator-user-id',
        impersonatedUserId: 'impersonated-user-id',
        impersonationLevel,
      });

      expect(insertWorkspaceEvent.mock.calls).toEqual([
        [
          IMPERSONATION_EVENT,
          expect.objectContaining({
            level: impersonationLevel,
            action: 'attempted',
          }),
        ],
        [
          IMPERSONATION_EVENT,
          expect.objectContaining({
            level: impersonationLevel,
            action: 'issued',
          }),
        ],
      ]);
    },
  );
});
