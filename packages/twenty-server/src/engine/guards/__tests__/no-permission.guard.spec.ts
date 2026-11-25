import { type ExecutionContext } from '@nestjs/common';

import { buildExecutionContextMock } from 'test/utils/build-execution-context-mock.util';

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
      const differentContext = buildExecutionContextMock();

      const result = guard.canActivate(differentContext);

      expect(result).toBe(true);
    });
  });
});
