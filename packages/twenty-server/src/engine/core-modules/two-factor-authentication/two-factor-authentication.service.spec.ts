import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { KeyWrappingService } from 'src/engine/core-modules/encryption/keys/wrapping/key-wrapping.service';

import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';
import { TWO_FACTOR_AUTHENTICATION_STRATEGY } from './two-factor-authentication.constants';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { OTPStatus } from './two-factor-authentication.interface';

import { TwoFactorAuthenticationMethod } from './entities/two-factor-authentication-method.entity';

const createMockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const createMockConfigService = () => ({
  get: jest.fn(),
});

const createMockUserWorkspaceService = () => ({
  getUserWorkspaceForUserOrThrow: jest.fn(),
});

const createMockStrategy = () => ({
  name: 'mock-strategy',
  initiate: jest.fn(),
  validate: jest.fn(),
});

const createMockKeyWrappingService = () => ({
  wrapKey: jest.fn(() => 'wrapped-key'),
  unwrapKey: jest.fn(() => 'unwrapped-key'),
});

describe('TwoFactorAuthenticationService', () => {
  let service: TwoFactorAuthenticationService;
  let repository: ReturnType<typeof createMockRepository>;
  let configService: ReturnType<typeof createMockConfigService>;
  let userWorkspaceService: ReturnType<typeof createMockUserWorkspaceService>;
  let strategy: ReturnType<typeof createMockStrategy>;
  let keyWrappingService: ReturnType<typeof createMockKeyWrappingService>;

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
        { provide: TwentyConfigService, useFactory: createMockConfigService },
        {
          provide: UserWorkspaceService,
          useFactory: createMockUserWorkspaceService,
        },
        {
          provide: TWO_FACTOR_AUTHENTICATION_STRATEGY,
          useFactory: createMockStrategy,
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
    configService = module.get(TwentyConfigService);
    userWorkspaceService = module.get(UserWorkspaceService);
    strategy = module.get(TWO_FACTOR_AUTHENTICATION_STRATEGY);
    keyWrappingService = module.get(KeyWrappingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('is2FARequired', () => {
    it('should do nothing if 2FA is globally disabled', async () => {
      configService.get.mockReturnValue(false);
      await expect(
        service.is2FARequired({} as any, {} as any),
      ).resolves.toBeUndefined();
      expect(configService.get).toHaveBeenCalledWith(
        'IS_TWO_FACTOR_AUTHENTICATION_ENABLED',
      );
    });

    it('should do nothing if workspace does not enforce 2FA', async () => {
      configService.get.mockReturnValue(true);
      const mockWorkspace = {
        twoFactorAuthenticationPolicy: null,
      } as unknown as Workspace;

      await expect(
        service.is2FARequired(mockWorkspace, {} as any),
      ).resolves.toBeUndefined();
    });

    it('should throw PROVISION_REQUIRED if 2FA is required but not set up', async () => {
      configService.get.mockReturnValue(true);
      const mockWorkspace = {
        twoFactorAuthenticationPolicy: 'REQUIRED',
      } as unknown as Workspace;
      const expectedError = new AuthException(
        'Two factor authentication setup required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
      );

      await expect(
        service.is2FARequired(mockWorkspace, undefined),
      ).rejects.toThrow(expectedError);
    });

    it('should throw VERIFICATION_REQUIRED if 2FA is required and set up', async () => {
      configService.get.mockReturnValue(true);
      const mockWorkspace = {
        twoFactorAuthenticationPolicy: 'REQUIRED',
      } as unknown as Workspace;
      const mockProvider = [{}] as TwoFactorAuthenticationMethod[];
      const expectedError = new AuthException(
        'Two factor authentication verification required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_VERIFICATION_REQUIRED,
      );

      await expect(
        service.is2FARequired(mockWorkspace, mockProvider),
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
      const rawSecret = 'RAW_OTP_SECRET';
      const wrappedSecret = 'ENCRYPTED_HEX_STRING';

      repository.findOne.mockResolvedValue(null);
      strategy.initiate.mockReturnValue({
        uri: 'otpauth://...',
        context: {
          secret: rawSecret,
          status: 'PENDING',
        },
      });

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

      expect(
        userWorkspaceService.getUserWorkspaceForUserOrThrow,
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        workspaceId: workspace.id,
      });

      expect(strategy.initiate).toHaveBeenCalledWith(
        mockUser.email,
        workspace.name,
        0,
      );

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            secret: wrappedSecret,
            status: 'PENDING',
          },
          strategy: 'mock-strategy',
        }),
      );
    });

    it('should throw if 2FA is already provisioned and verified', async () => {
      const existingMethod = {
        context: {
          status: 'VERIFIED',
        },
      };

      repository.findOne.mockResolvedValue(existingMethod);
      const expectedError = new TwoFactorAuthenticationException(
        'Two factor authentication has already been provisioned. Please delete and try again.',
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
      context: {
        status: 'PENDING',
        secret: wrappedSecret,
      },
      userWorkspace: {
        user: mockUser,
      },
    };
    const otpToken = '123456';

    it('should successfully validate a token and return the user', async () => {
      repository.findOne.mockResolvedValue(mock2FAMethod);
      (keyWrappingService.unwrapKey as jest.Mock).mockResolvedValue({
        unwrappedKey: rawSecret,
      });

      strategy.validate.mockReturnValue(true);

      const user = await service.validateStrategy(
        mockUser.id,
        otpToken,
        workspace.id,
      );

      expect(user).toEqual(mockUser);

      expect(strategy.validate).toHaveBeenCalledWith(otpToken, {
        status: mock2FAMethod.context.status,
        secret: rawSecret,
      });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            status: OTPStatus.VERIFIED,
            secret: wrappedSecret,
          }),
          userWorkspace: {
            user: {
              email: user.email,
              id: user.id,
            },
          },
        }),
      );
    });

    // it('should throw if the token is invalid', async () => {
    //   repository.findOne.mockResolvedValue(mock2FAMethod);
    //   strategy.validate.mockReturnValue(false);
    //   const expectedError = new TwoFactorAuthenticationException('Invalid OTP', TwoFactorAuthenticationExceptionCode.INVALID_OTP);

    //   await expect(service.validateStrategy('user_123', 'wrong-token', 'ws_123')).rejects.toThrow(expectedError);
    // });

    // it('should throw if the 2FA method is not found or malformed', async () => {
    //   repository.findOne.mockResolvedValue(null);
    //   const expectedError = new TwoFactorAuthenticationException(
    //     'Malformed Database Object',
    //     TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT,
    //   );

    //   await expect(service.validateStrategy('user_123', '123456', 'ws_123')).rejects.toThrow(expectedError);
    // });
  });
});
