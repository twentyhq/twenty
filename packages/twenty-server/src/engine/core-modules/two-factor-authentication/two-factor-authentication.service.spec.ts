import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { KeyWrappingService } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { TwoFactorAuthenticationMethod } from './entities/two-factor-authentication-method.entity';
import { OTPStatus } from './strategies/otp/otp.constants';

const totpStrategyMocks = {
  validate: jest.fn(),
  initiate: jest.fn(() => ({
    uri: 'otpauth://...',
    context: {
      secret: 'RAW_OTP_SECRET',
      status: 'PENDING',
    },
  })),
};

jest.mock('./strategies/otp/totp/totp.strategy', () => {
  return {
    TotpStrategy: jest.fn().mockImplementation(() => {
      return {
        name: 'mock-strategy',
        validate: totpStrategyMocks.validate,
        initiate: totpStrategyMocks.initiate,
      };
    }),
  };
});

const createMockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const createMockUserWorkspaceService = () => ({
  getUserWorkspaceForUserOrThrow: jest.fn(),
});

const createMockKeyWrappingService = () => ({
  wrapKey: jest.fn(() => 'wrapped-key'),
  unwrapKey: jest.fn(() => 'unwrapped-key'),
});

describe('TwoFactorAuthenticationService', () => {
  let service: TwoFactorAuthenticationService;
  let repository: ReturnType<typeof createMockRepository>;
  let userWorkspaceService: ReturnType<typeof createMockUserWorkspaceService>;
  let keyWrappingService: ReturnType<typeof createMockKeyWrappingService>;
  const rawSecret = 'RAW_OTP_SECRET';
  const wrappedSecret = 'ENCRYPTED_HEX_STRING';

  const mockUserWorkspace = {
    id: 'uw_123',
    workspace: {
      displayName: 'Test Workspace',
    },
  };

  const mockUser = {
    id: 'user_123',
    email: 'test@test.com',
  };

  const workspace = {
    id: 'ws_123',
    name: 'Test Workspace',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthenticationService,
        {
          provide: getRepositoryToken(TwoFactorAuthenticationMethod, 'core'),
          useFactory: createMockRepository,
        },
        {
          provide: UserWorkspaceService,
          useFactory: createMockUserWorkspaceService,
        },
        {
          provide: KeyWrappingService,
          useFactory: createMockKeyWrappingService,
        },
      ],
    }).compile();

    service = module.get<TwoFactorAuthenticationService>(
      TwoFactorAuthenticationService,
    );
    repository = module.get(
      getRepositoryToken(TwoFactorAuthenticationMethod, 'core'),
    );
    userWorkspaceService = module.get(UserWorkspaceService);
    keyWrappingService = module.get(KeyWrappingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTwoFactorAuthenticationRequirement', () => {
    it('should do nothing if workspace does not enforce 2FA', async () => {
      const mockWorkspace = {
        isTwoFactorAuthenticationEnforced: false,
      } as unknown as Workspace;

      await expect(
        service.validateTwoFactorAuthenticationRequirement(mockWorkspace),
      ).resolves.toBeUndefined();
    });

    it('should throw PROVISION_REQUIRED if 2FA is required but not set up', async () => {
      const mockWorkspace = {
        isTwoFactorAuthenticationEnforced: true,
      } as unknown as Workspace;
      const expectedError = new AuthException(
        'Two factor authentication setup required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
      );

      await expect(
        service.validateTwoFactorAuthenticationRequirement(mockWorkspace),
      ).rejects.toThrow(expectedError);
    });

    it('should throw VERIFICATION_REQUIRED if 2FA is set up', async () => {
      const mockWorkspace = {} as Workspace;
      const mockProvider = [
        {
          status: 'VERIFIED',
        },
      ] as TwoFactorAuthenticationMethod[];
      const expectedError = new AuthException(
        'Two factor authentication verification required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED,
      );

      await expect(
        service.validateTwoFactorAuthenticationRequirement(
          mockWorkspace,
          mockProvider,
        ),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('initiateStrategyConfiguration', () => {
    beforeEach(() => {
      userWorkspaceService.getUserWorkspaceForUserOrThrow.mockResolvedValue(
        mockUserWorkspace as any,
      );
    });

    it('should initiate configuration for a new user', async () => {
      repository.findOne.mockResolvedValue(null);

      (keyWrappingService.wrapKey as jest.Mock).mockResolvedValue({
        wrappedKey: wrappedSecret,
      });

      const uri = await service.initiateStrategyConfiguration(
        mockUser.id,
        mockUser.email,
        workspace.id,
      );

      expect(uri).toBe('otpauth://...');
      expect(keyWrappingService.wrapKey).toHaveBeenCalledWith(
        Buffer.from(rawSecret),
        mockUser.id + workspace.id + 'otp-secret',
      );
      expect(repository.save).toHaveBeenCalledWith({
        id: undefined,
        userWorkspace: mockUserWorkspace,
        secret: wrappedSecret,
        status: 'PENDING',
        strategy: TwoFactorAuthenticationStrategy.TOTP,
      });

      expect(
        userWorkspaceService.getUserWorkspaceForUserOrThrow,
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        workspaceId: workspace.id,
      });

      expect(totpStrategyMocks.initiate).toHaveBeenCalledWith(
        mockUser.email,
        `Twenty - ${workspace.name}`,
      );

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          secret: wrappedSecret,
          status: 'PENDING',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
        }),
      );
    });

    it('should throw if 2FA is already provisioned and verified', async () => {
      const existingMethod = {
        status: 'VERIFIED',
      };

      repository.findOne.mockResolvedValue(existingMethod);
      const expectedError = new TwoFactorAuthenticationException(
        'A two factor authentication method has already been set. Please delete it and try again.',
        TwoFactorAuthenticationExceptionCode.TWO_FACTOR_AUTHENTICATION_METHOD_ALREADY_PROVISIONED,
      );

      await expect(
        service.initiateStrategyConfiguration(
          mockUser.id,
          mockUser.email,
          workspace.id,
        ),
      ).rejects.toThrow(expectedError);
    });
  });

  describe('validateStrategy', () => {
    const rawSecret = 'RAW_OTP_SECRET';
    const wrappedSecret = 'ENCRYPTED_HEX_STRING';
    const mock2FAMethod = {
      status: 'PENDING',
      secret: wrappedSecret,
      userWorkspace: {
        user: mockUser,
      },
    };
    const otpToken = '123456';

    it('should successfully validate a valid token', async () => {
      repository.findOne.mockResolvedValue(mock2FAMethod);
      (keyWrappingService.unwrapKey as jest.Mock).mockResolvedValue({
        unwrappedKey: rawSecret,
      });

      totpStrategyMocks.validate.mockReturnValue({
        isValid: true,
        context: { status: mock2FAMethod.status, secret: rawSecret },
      });

      await service.validateStrategy(
        mockUser.id,
        otpToken,
        workspace.id,
        TwoFactorAuthenticationStrategy.TOTP,
      );

      expect(totpStrategyMocks.validate).toHaveBeenCalledWith(otpToken, {
        status: mock2FAMethod.status,
        secret: rawSecret,
      });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OTPStatus.VERIFIED,
        }),
      );
    });

    it('should throw if the token is invalid', async () => {
      repository.findOne.mockResolvedValue(mock2FAMethod);
      totpStrategyMocks.validate.mockReturnValue({
        isValid: false,
        context: mock2FAMethod,
      });
      const expectedError = new TwoFactorAuthenticationException(
        'Invalid OTP',
        TwoFactorAuthenticationExceptionCode.INVALID_OTP,
      );

      await expect(
        service.validateStrategy(
          'user_123',
          'wrong-token',
          'ws_123',
          TwoFactorAuthenticationStrategy.TOTP,
        ),
      ).rejects.toThrow(expectedError);
    });

    it('should throw if the 2FA method is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const expectedError2 = new TwoFactorAuthenticationException(
        'Two Factor Authentication Method not found.',
        TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT,
      );

      await expect(
        service.validateStrategy(
          'user_123',
          '123456',
          'ws_123',
          TwoFactorAuthenticationStrategy.TOTP,
        ),
      ).rejects.toThrow(expectedError2);
    });
  });

  describe('verifyTwoFactorAuthenticationMethodForAuthenticatedUser', () => {
    const rawSecret = 'RAW_OTP_SECRET';
    const wrappedSecret = 'ENCRYPTED_HEX_STRING';
    const mock2FAMethod = {
      status: 'PENDING',
      secret: wrappedSecret,
      userWorkspace: {
        user: mockUser,
      },
    };
    const otpToken = '123456';

    it('should successfully verify and return success', async () => {
      repository.findOne.mockResolvedValue(mock2FAMethod);
      (keyWrappingService.unwrapKey as jest.Mock).mockResolvedValue({
        unwrappedKey: rawSecret,
      });

      totpStrategyMocks.validate.mockReturnValue({
        isValid: true,
        context: { status: mock2FAMethod.status, secret: rawSecret },
      });

      const result =
        await service.verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
          mockUser.id,
          otpToken,
          workspace.id,
        );

      expect(result).toEqual({ success: true });
      expect(totpStrategyMocks.validate).toHaveBeenCalledWith(otpToken, {
        status: mock2FAMethod.status,
        secret: rawSecret,
      });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: OTPStatus.VERIFIED,
        }),
      );
    });

    it('should throw if the token is invalid', async () => {
      repository.findOne.mockResolvedValue(mock2FAMethod);
      totpStrategyMocks.validate.mockReturnValue({
        isValid: false,
        context: mock2FAMethod,
      });
      const expectedError = new TwoFactorAuthenticationException(
        'Invalid OTP',
        TwoFactorAuthenticationExceptionCode.INVALID_OTP,
      );

      await expect(
        service.verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
          mockUser.id,
          'wrong-token',
          workspace.id,
        ),
      ).rejects.toThrow(expectedError);
    });
  });
});
