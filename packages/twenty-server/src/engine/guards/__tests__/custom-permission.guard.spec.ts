import { type ExecutionContext } from '@nestjs/common';

import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';

describe('CustomPermissionGuard', () => {
  let guard: CustomPermissionGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    guard = new CustomPermissionGuard();
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
