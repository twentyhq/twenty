import { type ExecutionContext } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

describe('PublicEndpointGuard', () => {
  let guard: PublicEndpointGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicEndpointGuard],
    }).compile();

    guard = module.get<PublicEndpointGuard>(PublicEndpointGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should always return true for any execution context', () => {
    const mockContext = {} as ExecutionContext;
    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should return true even with null context', () => {
    const result = guard.canActivate(null as any);

    expect(result).toBe(true);
  });

  it('should be injectable', () => {
    expect(guard).toBeInstanceOf(PublicEndpointGuard);
  });
});
