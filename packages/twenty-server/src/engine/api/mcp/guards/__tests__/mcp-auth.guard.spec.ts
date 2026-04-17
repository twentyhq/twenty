import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { McpAuthGuard } from 'src/engine/api/mcp/guards/mcp-auth.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

describe('McpAuthGuard', () => {
  let guard: McpAuthGuard;
  let jwtAuthGuard: jest.Mocked<JwtAuthGuard>;

  const mockSetHeader = jest.fn();
  const buildContext = (host = 'crm.example.com'): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ setHeader: mockSetHeader }),
        getRequest: () => ({
          protocol: 'https',
          get: (name: string) => (name === 'host' ? host : undefined),
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jwtAuthGuard = {
      canActivate: jest.fn(),
    } as unknown as jest.Mocked<JwtAuthGuard>;

    guard = new McpAuthGuard(jwtAuthGuard);
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
      'Bearer resource_metadata="https://acme.twenty.com/.well-known/oauth-protected-resource"',
    );
  });
});
