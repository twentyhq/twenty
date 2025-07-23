import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { TwoFactorAuthenticationResolver } from './two-factor-authentication.resolver';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

import { DeleteTwoFactorAuthenticationMethodInput } from './dto/delete-two-factor-authentication-method.input';
import { InitiateTwoFactorAuthenticationProvisioningInput } from './dto/initiate-two-factor-authentication-provisioning.input';
import { VerifyTwoFactorAuthenticationMethodInput } from './dto/verify-two-factor-authentication-method.input';
import { TwoFactorAuthenticationMethod } from './entities/two-factor-authentication-method.entity';

const createMockRepository = () => ({
  findOne: jest.fn(),
  delete: jest.fn(),
});

const createMockTwoFactorAuthenticationService = () => ({
  initiateStrategyConfiguration: jest.fn(),
  verifyTwoFactorAuthenticationMethodForAuthenticatedUser: jest.fn(),
});

const createMockLoginTokenService = () => ({
  verifyLoginToken: jest.fn(),
});

const createMockUserService = () => ({
  getUserByEmail: jest.fn(),
});

const createMockDomainManagerService = () => ({
  getWorkspaceByOriginOrDefaultWorkspace: jest.fn(),
});

describe('TwoFactorAuthenticationResolver', () => {
  let resolver: TwoFactorAuthenticationResolver;
  let twoFactorAuthenticationService: ReturnType<
    typeof createMockTwoFactorAuthenticationService
  >;
  let loginTokenService: ReturnType<typeof createMockLoginTokenService>;
  let userService: ReturnType<typeof createMockUserService>;
  let domainManagerService: ReturnType<typeof createMockDomainManagerService>;
  let repository: ReturnType<typeof createMockRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
  } as User;

  const mockWorkspace: Workspace = {
    id: 'workspace-123',
    displayName: 'Test Workspace',
  } as Workspace;

  const mockTwoFactorMethod: TwoFactorAuthenticationMethod = {
    id: '2fa-method-123',
    userWorkspace: {
      userId: 'user-123',
      workspaceId: 'workspace-123',
    },
  } as TwoFactorAuthenticationMethod;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwoFactorAuthenticationResolver,
        {
          provide: TwoFactorAuthenticationService,
          useFactory: createMockTwoFactorAuthenticationService,
        },
        {
          provide: LoginTokenService,
          useFactory: createMockLoginTokenService,
        },
        {
          provide: UserService,
          useFactory: createMockUserService,
        },
        {
          provide: DomainManagerService,
          useFactory: createMockDomainManagerService,
        },
        {
          provide: getRepositoryToken(TwoFactorAuthenticationMethod, 'core'),
          useFactory: createMockRepository,
        },
      ],
    }).compile();

    resolver = module.get<TwoFactorAuthenticationResolver>(
      TwoFactorAuthenticationResolver,
    );
    twoFactorAuthenticationService = module.get(TwoFactorAuthenticationService);
    loginTokenService = module.get(LoginTokenService);
    userService = module.get(UserService);
    domainManagerService = module.get(DomainManagerService);
    repository = module.get(
      getRepositoryToken(TwoFactorAuthenticationMethod, 'core'),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('initiateOTPProvisioning', () => {
    const mockInput: InitiateTwoFactorAuthenticationProvisioningInput = {
      loginToken: 'valid-login-token',
    };
    const origin = 'https://app.twenty.com';

    beforeEach(() => {
      loginTokenService.verifyLoginToken.mockResolvedValue({
        sub: mockUser.email,
        workspaceId: mockWorkspace.id,
      });
      domainManagerService.getWorkspaceByOriginOrDefaultWorkspace.mockResolvedValue(
        mockWorkspace,
      );
      userService.getUserByEmail.mockResolvedValue(mockUser);
      twoFactorAuthenticationService.initiateStrategyConfiguration.mockResolvedValue(
        'otpauth://totp/Twenty:test@example.com?secret=SECRETKEY&issuer=Twenty',
      );
    });

    it('should successfully initiate OTP provisioning', async () => {
      const result = await resolver.initiateOTPProvisioning(mockInput, origin);

      expect(result).toEqual({
        uri: 'otpauth://totp/Twenty:test@example.com?secret=SECRETKEY&issuer=Twenty',
      });
      expect(loginTokenService.verifyLoginToken).toHaveBeenCalledWith(
        mockInput.loginToken,
      );
      expect(
        domainManagerService.getWorkspaceByOriginOrDefaultWorkspace,
      ).toHaveBeenCalledWith(origin);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(
        twoFactorAuthenticationService.initiateStrategyConfiguration,
      ).toHaveBeenCalledWith(mockUser.id, mockUser.email, mockWorkspace.id);
    });

    it('should throw WORKSPACE_NOT_FOUND when workspace is not found', async () => {
      domainManagerService.getWorkspaceByOriginOrDefaultWorkspace.mockResolvedValue(
        null,
      );

      await expect(
        resolver.initiateOTPProvisioning(mockInput, origin),
      ).rejects.toThrow(
        new AuthException(
          'Workspace not found',
          AuthExceptionCode.WORKSPACE_NOT_FOUND,
        ),
      );
    });

    it('should throw FORBIDDEN_EXCEPTION when token workspace does not match', async () => {
      loginTokenService.verifyLoginToken.mockResolvedValue({
        sub: mockUser.email,
        workspaceId: 'different-workspace-id',
      });

      await expect(
        resolver.initiateOTPProvisioning(mockInput, origin),
      ).rejects.toThrow(
        new AuthException(
          'Token is not valid for this workspace',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw INTERNAL_SERVER_ERROR when URI is missing', async () => {
      twoFactorAuthenticationService.initiateStrategyConfiguration.mockResolvedValue(
        undefined,
      );

      await expect(
        resolver.initiateOTPProvisioning(mockInput, origin),
      ).rejects.toThrow(
        new AuthException(
          'OTP Auth URL missing',
          AuthExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('initiateOTPProvisioningForAuthenticatedUser', () => {
    beforeEach(() => {
      twoFactorAuthenticationService.initiateStrategyConfiguration.mockResolvedValue(
        'otpauth://totp/Twenty:test@example.com?secret=SECRETKEY&issuer=Twenty',
      );
    });

    it('should successfully initiate OTP provisioning for authenticated user', async () => {
      const result = await resolver.initiateOTPProvisioningForAuthenticatedUser(
        mockUser,
        mockWorkspace,
      );

      expect(result).toEqual({
        uri: 'otpauth://totp/Twenty:test@example.com?secret=SECRETKEY&issuer=Twenty',
      });
      expect(
        twoFactorAuthenticationService.initiateStrategyConfiguration,
      ).toHaveBeenCalledWith(mockUser.id, mockUser.email, mockWorkspace.id);
    });

    it('should throw INTERNAL_SERVER_ERROR when URI is missing', async () => {
      twoFactorAuthenticationService.initiateStrategyConfiguration.mockResolvedValue(
        undefined,
      );

      await expect(
        resolver.initiateOTPProvisioningForAuthenticatedUser(
          mockUser,
          mockWorkspace,
        ),
      ).rejects.toThrow(
        new AuthException(
          'OTP Auth URL missing',
          AuthExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('deleteTwoFactorAuthenticationMethod', () => {
    const mockInput: DeleteTwoFactorAuthenticationMethodInput = {
      twoFactorAuthenticationMethodId: '2fa-method-123',
    };

    beforeEach(() => {
      repository.findOne.mockResolvedValue(mockTwoFactorMethod);
      repository.delete.mockResolvedValue({ affected: 1 });
    });

    it('should successfully delete two-factor authentication method', async () => {
      const result = await resolver.deleteTwoFactorAuthenticationMethod(
        mockInput,
        mockWorkspace,
        mockUser,
      );

      expect(result).toEqual({ success: true });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockInput.twoFactorAuthenticationMethodId,
        },
        relations: ['userWorkspace'],
      });
      expect(repository.delete).toHaveBeenCalledWith(
        mockInput.twoFactorAuthenticationMethodId,
      );
    });

    it('should throw INVALID_INPUT when method is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        resolver.deleteTwoFactorAuthenticationMethod(
          mockInput,
          mockWorkspace,
          mockUser,
        ),
      ).rejects.toThrow(
        new AuthException(
          'Two-factor authentication method not found',
          AuthExceptionCode.INVALID_INPUT,
        ),
      );
    });

    it('should throw FORBIDDEN_EXCEPTION when user does not own the method', async () => {
      const wrongUserMethod = {
        ...mockTwoFactorMethod,
        userWorkspace: {
          userId: 'different-user-id',
          workspaceId: mockWorkspace.id,
        },
      };

      repository.findOne.mockResolvedValue(wrongUserMethod);

      await expect(
        resolver.deleteTwoFactorAuthenticationMethod(
          mockInput,
          mockWorkspace,
          mockUser,
        ),
      ).rejects.toThrow(
        new AuthException(
          'You can only delete your own two-factor authentication methods',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });

    it('should throw FORBIDDEN_EXCEPTION when workspace does not match', async () => {
      const wrongWorkspaceMethod = {
        ...mockTwoFactorMethod,
        userWorkspace: {
          userId: mockUser.id,
          workspaceId: 'different-workspace-id',
        },
      };

      repository.findOne.mockResolvedValue(wrongWorkspaceMethod);

      await expect(
        resolver.deleteTwoFactorAuthenticationMethod(
          mockInput,
          mockWorkspace,
          mockUser,
        ),
      ).rejects.toThrow(
        new AuthException(
          'You can only delete your own two-factor authentication methods',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        ),
      );
    });
  });

  describe('verifyTwoFactorAuthenticationMethodForAuthenticatedUser', () => {
    const mockInput: VerifyTwoFactorAuthenticationMethodInput = {
      otp: '123456',
    };

    beforeEach(() => {
      twoFactorAuthenticationService.verifyTwoFactorAuthenticationMethodForAuthenticatedUser.mockResolvedValue(
        { success: true },
      );
    });

    it('should successfully verify two-factor authentication method', async () => {
      const result =
        await resolver.verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
          mockInput,
          mockWorkspace,
          mockUser,
        );

      expect(result).toEqual({ success: true });
      expect(
        twoFactorAuthenticationService.verifyTwoFactorAuthenticationMethodForAuthenticatedUser,
      ).toHaveBeenCalledWith(mockUser.id, mockInput.otp, mockWorkspace.id);
    });

    it('should propagate service errors', async () => {
      const serviceError = new Error('Invalid OTP');

      twoFactorAuthenticationService.verifyTwoFactorAuthenticationMethodForAuthenticatedUser.mockRejectedValue(
        serviceError,
      );

      await expect(
        resolver.verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
          mockInput,
          mockWorkspace,
          mockUser,
        ),
      ).rejects.toThrow(serviceError);
    });
  });
});
