import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { McpAuthGuard } from 'src/engine/api/mcp/guards/mcp-auth.guard';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

describe('McpAuthGuard', () => {
  let guard: McpAuthGuard;
  let jwtAuthGuard: jest.Mocked<JwtAuthGuard>;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;

  const mockSetHeader = jest.fn();
  const mockContext = {
    switchToHttp: () => ({
      getResponse: () => ({ setHeader: mockSetHeader }),
      getRequest: () => ({}),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jwtAuthGuard = {
      canActivate: jest.fn(),
    } as unknown as jest.Mocked<JwtAuthGuard>;
    twentyConfigService = {
      get: jest.fn().mockReturnValue('https://crm.example.com'),
    } as unknown as jest.Mocked<TwentyConfigService>;

    guard = new McpAuthGuard(jwtAuthGuard, twentyConfigService);
    mockSetHeader.mockClear();
  });

  it('should return true when JwtAuthGuard passes', async () => {
    jwtAuthGuard.canActivate.mockResolvedValue(true);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockSetHeader).not.toHaveBeenCalled();
  });

  it('should set WWW-Authenticate header and throw when auth fails', async () => {
    jwtAuthGuard.canActivate.mockResolvedValue(false);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockSetHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Bearer resource_metadata="https://crm.example.com/.well-known/oauth-protected-resource"',
    );
  });
});
