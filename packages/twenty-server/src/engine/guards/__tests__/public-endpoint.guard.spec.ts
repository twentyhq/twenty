import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PublicEndpoint } from 'src/engine/guards/public-endpoint.guard';

describe('PublicEndpoint', () => {
  let guard: PublicEndpoint;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicEndpoint],
    }).compile();

    guard = module.get<PublicEndpoint>(PublicEndpoint);
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
    expect(guard).toBeInstanceOf(PublicEndpoint);
  });
});
