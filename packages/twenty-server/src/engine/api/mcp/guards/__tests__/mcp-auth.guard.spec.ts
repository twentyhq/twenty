import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { buildExecutionContextMock } from 'test/utils/build-execution-context-mock.util';

import { McpAuthGuard } from 'src/engine/api/mcp/guards/mcp-auth.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

describe('McpAuthGuard', () => {
  let guard: McpAuthGuard;
  let jwtAuthGuard: jest.Mocked<JwtAuthGuard>;

  const mockSetHeader = jest.fn();
  const buildContext = (host = 'crm.example.com'): ExecutionContext =>
    buildExecutionContextMock({
      request: {
        protocol: 'https',
        get: (name: string) => (name === 'host' ? host : undefined),
      },
      response: { setHeader: mockSetHeader },
    });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        McpAuthGuard,
        { provide: JwtAuthGuard, useValue: { canActivate: jest.fn() } },
      ],
    }).compile();

    guard = module.get(McpAuthGuard);
    jwtAuthGuard = module.get(JwtAuthGuard);
    mockSetHeader.mockClear();
  });

  it('should return true when JwtAuthGuard passes', async () => {
    jwtAuthGuard.canActivate.mockResolvedValue(true);

    const result = await guard.canActivate(buildContext());

    expect(result).toBe(true);
    expect(mockSetHeader).not.toHaveBeenCalled();
  });

  it('should set WWW-Authenticate using the request host and throw when auth fails', async () => {
    jwtAuthGuard.canActivate.mockResolvedValue(false);

    await expect(
      guard.canActivate(buildContext('acme.twenty.com')),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockSetHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Bearer resource_metadata="https://acme.twenty.com/.well-known/oauth-protected-resource/mcp", scope="api profile"',
    );
  });
});
