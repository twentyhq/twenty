import { type ExecutionContext } from '@nestjs/common';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

describe('NoPermissionGuard', () => {
  let guard: NoPermissionGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    guard = new NoPermissionGuard();
    mockExecutionContext = {} as ExecutionContext;
  });

  describe('canActivate', () => {
    it('should always return true', () => {
      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true even with different contexts', () => {
      const differentContext = {
        switchToHttp: jest.fn(),
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(differentContext);

      expect(result).toBe(true);
    });
  });
});
