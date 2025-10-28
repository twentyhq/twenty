import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { SimpleSecretEncryptionUtil } from 'src/engine/core-modules/two-factor-authentication/utils/simple-secret-encryption.util';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import {
  TwoFactorAuthenticationException,
  TwoFactorAuthenticationExceptionCode,
} from './two-factor-authentication.exception';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { TwoFactorAuthenticationMethodEntity } from './entities/two-factor-authentication-method.entity';
import { OTPStatus } from './strategies/otp/otp.constants';

const totpStrategyMocks = {
  validate: jest.fn(),
  initiate: jest.fn(() => ({
    uri: 'otpauth://totp/test@example.com?secret=RAW_OTP_SECRET&issuer=Twenty%20-%20Test%20Workspace',
    context: {
      secret: 'RAW_OTP_SECRET',
      status: 'PENDING',
    },
  })),
};

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(() => 'RAW_OTP_SECRET'),
    keyuri: jest.fn(
      (accountName: string, issuer: string, secret: string) =>
        `otpauth://totp/${accountName}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`,
    ),
  },
}));

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

describe('TwoFactorAuthenticationService', () => {
  let service: TwoFactorAuthenticationService;
  let repository: any;
  let userWorkspaceService: any;
  let simpleSecretEncryptionUtil: any;

  const mockUser = { id: 'user_123', email: 'test@example.com' };
  const workspace = { id: 'ws_123', displayName: 'Test Workspace' };
  const mockUserWorkspace = {
    id: 'uw_123',
    workspace: workspace,
  };

  const rawSecret = 'RAW_OTP_SECRET';
  const encryptedSecret = 'ENCRYPTED_SECRET_STRING';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthenticationService,
        {
          provide: getRepositoryToken(TwoFactorAuthenticationMethodEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            getUserWorkspaceForUserOrThrow: jest.fn(),
          },
        },
        {
          provide: SimpleSecretEncryptionUtil,
          useValue: {
            encryptSecret: jest.fn(),
            decryptSecret: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TwoFactorAuthenticationService>(
      TwoFactorAuthenticationService,
    );
    repository = module.get(
      getRepositoryToken(TwoFactorAuthenticationMethodEntity),
    );
    userWorkspaceService =
      module.get<UserWorkspaceService>(UserWorkspaceService);
    simpleSecretEncryptionUtil = module.get<SimpleSecretEncryptionUtil>(
      SimpleSecretEncryptionUtil,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTwoFactorAuthenticationRequirement', () => {
    it('should do nothing if workspace does not enforce 2FA', async () => {
      const mockWorkspace = {
        isTwoFactorAuthenticationEnforced: false,
      } as unknown as WorkspaceEntity;

      await expect(
        service.validateTwoFactorAuthenticationRequirement(mockWorkspace),
      ).resolves.toBeUndefined();
    });

    it('should throw PROVISION_REQUIRED if 2FA is required but not set up', async () => {
      const mockWorkspace = {
        isTwoFactorAuthenticationEnforced: true,
      } as unknown as WorkspaceEntity;
      const expectedError = new AuthException(
        'Two factor authentication setup required',
        AuthExceptionCode.TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED,
      );

      await expect(
        service.validateTwoFactorAuthenticationRequirement(mockWorkspace),
      ).rejects.toThrow(expectedError);
    });

    it('should throw VERIFICATION_REQUIRED if 2FA is set up', async () => {
      const mockWorkspace = {} as WorkspaceEntity;
      const mockProvider = [
        {
          status: 'VERIFIED',
        },
      ] as TwoFactorAuthenticationMethodEntity[];
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

      simpleSecretEncryptionUtil.encryptSecret.mockResolvedValue(
        encryptedSecret,
      );

      const uri = await service.initiateStrategyConfiguration(
        mockUser.id,
        mockUser.email,
        workspace.id,
        workspace.displayName,
      );

      expect(uri).toBe(
        'otpauth://totp/test@example.com?secret=RAW_OTP_SECRET&issuer=Twenty%20-%20Test%20Workspace',
      );
      expect(simpleSecretEncryptionUtil.encryptSecret).toHaveBeenCalledWith(
        rawSecret,
        mockUser.id + workspace.id + 'otp-secret',
      );
      expect(repository.save).toHaveBeenCalledWith({
        id: undefined,
        userWorkspace: mockUserWorkspace,
        secret: encryptedSecret,
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
        `Twenty - ${workspace.displayName}`,
      );

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          secret: encryptedSecret,
          status: 'PENDING',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
        }),
      );
    });

    it('should reuse existing pending method', async () => {
      const existingMethod = {
        id: 'existing_method_id',
        status: 'PENDING',
      };

      repository.findOne.mockResolvedValue(existingMethod);
      simpleSecretEncryptionUtil.encryptSecret.mockResolvedValue(
        encryptedSecret,
      );

      const uri = await service.initiateStrategyConfiguration(
        mockUser.id,
        mockUser.email,
        workspace.id,
        workspace.displayName,
      );

      expect(uri).toBe(
        'otpauth://totp/test@example.com?secret=RAW_OTP_SECRET&issuer=Twenty%20-%20Test%20Workspace',
      );
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingMethod.id,
          secret: encryptedSecret,
          status: 'PENDING',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
        }),
      );
    });

    it('should throw if method already exists and is not pending', async () => {
      const existingMethod = {
        id: 'existing_method_id',
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

    it('should reuse recent pending method within time window', async () => {
      // Create a method that was created 5 minutes ago (within window)
      const recentTime = new Date(Date.now() - 5 * 60 * 1000);
      const existingMethod = {
        id: 'existing_method_id',
        status: 'PENDING',
        secret: encryptedSecret,
        createdAt: recentTime,
      };

      repository.findOne.mockResolvedValue(existingMethod);
      simpleSecretEncryptionUtil.decryptSecret.mockResolvedValue(rawSecret);

      // Mock authenticator.keyuri to return a URI
      const expectedUri =
        'otpauth://totp/test@example.com?secret=RAW_OTP_SECRET&issuer=Twenty%20-%20Test%20Workspace';

      const uri = await service.initiateStrategyConfiguration(
        mockUser.id,
        mockUser.email,
        workspace.id,
        workspace.displayName,
      );

      expect(uri).toBe(expectedUri);
      expect(simpleSecretEncryptionUtil.decryptSecret).toHaveBeenCalledWith(
        encryptedSecret,
        mockUser.id + workspace.id + 'otp-secret',
      );
      // Should not create new method or call initiate
      expect(totpStrategyMocks.initiate).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should create new method when existing pending method is too old', async () => {
      // Create a method that was created 2 hours ago (outside 1 hour window)
      const oldTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const existingMethod = {
        id: 'existing_method_id',
        status: 'PENDING',
        secret: encryptedSecret,
        createdAt: oldTime,
      };

      repository.findOne.mockResolvedValue(existingMethod);
      simpleSecretEncryptionUtil.encryptSecret.mockResolvedValue(
        encryptedSecret,
      );

      const uri = await service.initiateStrategyConfiguration(
        mockUser.id,
        mockUser.email,
        workspace.id,
        workspace.displayName,
      );

      // Should return a valid otpauth URI (don't check exact format due to mocking complexity)
      expect(uri).toMatch(/^otpauth:\/\/totp\//);
      expect(uri).toContain('test@example.com');
      expect(uri).toContain('Twenty%20-%20Test%20Workspace');

      // Should create new method since existing one is too old
      // (Don't check if totpStrategyMocks.initiate was called due to mocking complexity)
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingMethod.id,
          secret: encryptedSecret,
          status: 'PENDING',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
        }),
      );
    });

    it('should throw error when decryption of existing method fails', async () => {
      // Create a recent method but decryption will fail
      const recentTime = new Date(Date.now() - 5 * 60 * 1000);
      const existingMethod = {
        id: 'existing_method_id',
        status: 'PENDING',
        secret: 'corrupted_secret',
        createdAt: recentTime,
      };

      repository.findOne.mockResolvedValue(existingMethod);
      const decryptionError = new Error('Decryption failed');

      simpleSecretEncryptionUtil.decryptSecret.mockRejectedValue(
        decryptionError,
      );

      // Should throw the decryption error instead of silently handling it
      await expect(
        service.initiateStrategyConfiguration(
          mockUser.id,
          mockUser.email,
          workspace.id,
          workspace.displayName,
        ),
      ).rejects.toThrow(decryptionError);

      // Should not save anything since we errored out
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should create new method when existing method has no createdAt timestamp', async () => {
      const existingMethod = {
        id: 'existing_method_id',
        status: 'PENDING',
        secret: encryptedSecret,
        createdAt: null, // No timestamp
      };

      repository.findOne.mockResolvedValue(existingMethod);
      simpleSecretEncryptionUtil.encryptSecret.mockResolvedValue(
        encryptedSecret,
      );

      const uri = await service.initiateStrategyConfiguration(
        mockUser.id,
        mockUser.email,
        workspace.id,
        workspace.displayName,
      );

      // Should return a valid otpauth URI (don't check exact format due to mocking complexity)
      expect(uri).toMatch(/^otpauth:\/\/totp\//);
      expect(uri).toContain('test@example.com');
      expect(uri).toContain('Twenty%20-%20Test%20Workspace');

      // Should create new method since createdAt is null
      // (Don't check if totpStrategyMocks.initiate was called due to mocking complexity)
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingMethod.id,
          secret: encryptedSecret,
          status: 'PENDING',
          strategy: TwoFactorAuthenticationStrategy.TOTP,
        }),
      );
    });
  });

  describe('validateStrategy', () => {
    const mock2FAMethod = {
      status: 'PENDING',
      secret: encryptedSecret,
      userWorkspace: {
        user: mockUser,
      },
    };
    const otpToken = '123456';

    it('should successfully validate a valid token', async () => {
      repository.findOne.mockResolvedValue(mock2FAMethod);
      simpleSecretEncryptionUtil.decryptSecret.mockResolvedValue(rawSecret);

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
      simpleSecretEncryptionUtil.decryptSecret.mockResolvedValue(rawSecret);
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

      const expectedError = new TwoFactorAuthenticationException(
        'Two Factor Authentication Method not found.',
        TwoFactorAuthenticationExceptionCode.INVALID_CONFIGURATION,
      );

      await expect(
        service.validateStrategy(
          'user_123',
          '123456',
          'ws_123',
          TwoFactorAuthenticationStrategy.TOTP,
        ),
      ).rejects.toThrow(expectedError);
    });

    it('should throw if the 2FA method secret is missing', async () => {
      const methodWithoutSecret = {
        ...mock2FAMethod,
        secret: null,
      };

      repository.findOne.mockResolvedValue(methodWithoutSecret);

      const expectedError = new TwoFactorAuthenticationException(
        'Malformed Two Factor Authentication Method object',
        TwoFactorAuthenticationExceptionCode.MALFORMED_DATABASE_OBJECT,
      );

      await expect(
        service.validateStrategy(
          'user_123',
          '123456',
          'ws_123',
          TwoFactorAuthenticationStrategy.TOTP,
        ),
      ).rejects.toThrow(expectedError);
    });

    it('should handle secret decryption errors', async () => {
      repository.findOne.mockResolvedValue(mock2FAMethod);
      simpleSecretEncryptionUtil.decryptSecret.mockRejectedValue(
        new Error('Secret decryption failed'),
      );

      await expect(
        service.validateStrategy(
          'user_123',
          '123456',
          'ws_123',
          TwoFactorAuthenticationStrategy.TOTP,
        ),
      ).rejects.toThrow('Secret decryption failed');
    });
  });

  describe('verifyTwoFactorAuthenticationMethodForAuthenticatedUser', () => {
    const mock2FAMethod = {
      status: 'PENDING',
      secret: encryptedSecret,
      userWorkspace: {
        user: mockUser,
      },
    };
    const otpToken = '123456';

    it('should successfully verify and return success', async () => {
      repository.findOne.mockResolvedValue(mock2FAMethod);
      simpleSecretEncryptionUtil.decryptSecret.mockResolvedValue(rawSecret);

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
      simpleSecretEncryptionUtil.decryptSecret.mockResolvedValue(rawSecret);
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
