import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DeleteResult, Repository } from 'typeorm';

import { WorkspaceTrustedDomain } from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import {
  WorkspaceTrustedDomainException,
  WorkspaceTrustedDomainExceptionCode,
} from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.exception';

import { WorkspaceTrustedDomainService } from './workspace-trusted-domain.service';

describe('WorkspaceTrustedDomainService - createTrustedDomain and checkIsVerified', () => {
  let service: WorkspaceTrustedDomainService;
  let workspaceTrustedDomainRepository: Repository<WorkspaceTrustedDomain>;
  let emailService: EmailService;
  let environmentService: EnvironmentService;
  let domainManagerService: DomainManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceTrustedDomainService,
        {
          provide: getRepositoryToken(WorkspaceTrustedDomain, 'core'),
          useValue: {
            delete: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DomainManagerService,
          useValue: {
            buildWorkspaceURL: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceTrustedDomainService>(
      WorkspaceTrustedDomainService,
    );
    workspaceTrustedDomainRepository = module.get(
      getRepositoryToken(WorkspaceTrustedDomain, 'core'),
    );
    emailService = module.get<EmailService>(EmailService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
  });

  describe('checkIsVerified', () => {
    it('should mark the domain as verified if it is the workspace custom domain and custom domain is enabled', () => {
      const domain = 'custom-domain.com';
      const inWorkspace = {
        customDomain: domain,
        isCustomDomainEnabled: true,
      } as Workspace;
      const fromUser = {
        email: 'user@otherdomain.com',
        isEmailVerified: true,
      } as User;

      const result = (service as any).checkIsVerified(
        domain,
        inWorkspace,
        fromUser,
      );

      expect(result).toBe(true);
    });

    it('should mark the domain as verified if the user email ends with the domain and the user email is verified', () => {
      const domain = 'custom-domain.com';
      const inWorkspace = {
        customDomain: null,
        isCustomDomainEnabled: false,
      } as Workspace;
      const fromUser = {
        email: 'user@custom-domain.com',
        isEmailVerified: true,
      } as User;

      const result = (service as any).checkIsVerified(
        domain,
        inWorkspace,
        fromUser,
      );

      expect(result).toBe(true);
    });

    it('should not mark the domain as verified if it is not a work domain', () => {
      const domain = 'gmail.com';
      const inWorkspace = {
        customDomain: null,
        isCustomDomainEnabled: false,
      } as Workspace;
      const fromUser = {
        email: 'user@gmail.com',
        isEmailVerified: true,
      } as User;

      const result = (service as any).checkIsVerified(
        domain,
        inWorkspace,
        fromUser,
      );

      expect(result).toBe(false);
    });

    it('should not mark the domain as verified if it is the workspace custom domain but custom domain is not enabled', () => {
      const domain = 'custom-domain.com';
      const inWorkspace = {
        customDomain: domain,
        isCustomDomainEnabled: false,
      } as Workspace;
      const fromUser = {
        email: 'user@otherdomain.com',
        isEmailVerified: true,
      } as User;

      const result = (service as any).checkIsVerified(
        domain,
        inWorkspace,
        fromUser,
      );

      expect(result).toBe(false);
    });

    it('should not mark the domain as verified if the user email does not end with the domain or is not verified', () => {
      const domain = 'example.com';
      const inWorkspace = {
        customDomain: null,
        isCustomDomainEnabled: false,
      } as Workspace;
      const fromUser = {
        email: 'user@otherdomain.com',
        isEmailVerified: false,
      } as User;

      const result = (service as any).checkIsVerified(
        domain,
        inWorkspace,
        fromUser,
      );

      expect(result).toBe(false);
    });
  });

  describe('createTrustedDomain', () => {
    it('should successfully create a trusted domain and mark it as verified based on checkIsVerified', async () => {
      const domain = 'custom-domain.com';
      const inWorkspace = {
        id: 'workspace-id',
        customDomain: null,
        isCustomDomainEnabled: false,
      } as Workspace;
      const fromUser = {
        email: 'user@custom-domain.com',
        isEmailVerified: true,
      } as User;

      const expectedTrustedDomain = {
        workspaceId: 'workspace-id',
        domain,
        isVerified: true,
      };

      jest
        .spyOn(workspaceTrustedDomainRepository, 'save')
        .mockResolvedValue(
          expectedTrustedDomain as unknown as WorkspaceTrustedDomain,
        );

      jest
        .spyOn(service, 'sendTrustedDomainValidationEmail')
        .mockResolvedValue();

      const result = await service.createTrustedDomain(
        domain,
        inWorkspace,
        fromUser,
        'validator@custom-domain.com',
      );

      expect(workspaceTrustedDomainRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'workspace-id',
          domain,
          isVerified: true,
        }),
      );
      expect(result).toEqual(expectedTrustedDomain);
    });
  });

  describe('deleteTrustedDomain', () => {
    it('should delete a trusted domain successfully', async () => {
      const workspace: Workspace = { id: 'workspace-id' } as Workspace;
      const trustedDomainId = 'trusted-domain-id';
      const trustedDomainEntity = {
        id: trustedDomainId,
        workspaceId: workspace.id,
      } as WorkspaceTrustedDomain;

      jest
        .spyOn(workspaceTrustedDomainRepository, 'findOneBy')
        .mockResolvedValue(trustedDomainEntity);
      jest
        .spyOn(workspaceTrustedDomainRepository, 'delete')
        .mockResolvedValue({} as unknown as DeleteResult);

      await service.deleteTrustedDomain(workspace, trustedDomainId);

      expect(workspaceTrustedDomainRepository.findOneBy).toHaveBeenCalledWith({
        id: trustedDomainId,
        workspaceId: workspace.id,
      });
      expect(workspaceTrustedDomainRepository.delete).toHaveBeenCalledWith(
        trustedDomainEntity,
      );
    });

    it('should throw an error if the trusted domain does not exist', async () => {
      const workspace: Workspace = { id: 'workspace-id' } as Workspace;
      const trustedDomainId = 'trusted-domain-id';

      jest
        .spyOn(workspaceTrustedDomainRepository, 'findOneBy')
        .mockResolvedValue(null);

      await expect(
        service.deleteTrustedDomain(workspace, trustedDomainId),
      ).rejects.toThrow();

      expect(workspaceTrustedDomainRepository.findOneBy).toHaveBeenCalledWith({
        id: trustedDomainId,
        workspaceId: workspace.id,
      });
      expect(workspaceTrustedDomainRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('sendTrustedDomainValidationEmail', () => {
    it('should throw an exception if the trusted domain is already validated', async () => {
      const trustedDomainId = 'trusted-domain-id';
      const sender = {} as User;
      const workspace = {} as Workspace;
      const email = 'validator@example.com';

      const trustedDomain = {
        id: trustedDomainId,
        isValidated: true,
      } as WorkspaceTrustedDomain;

      jest
        .spyOn(workspaceTrustedDomainRepository, 'findOneBy')
        .mockResolvedValue(trustedDomain);

      await expect(
        service.sendTrustedDomainValidationEmail(
          sender,
          email,
          workspace,
          trustedDomain,
        ),
      ).rejects.toThrowError(
        new WorkspaceTrustedDomainException(
          'Trusted domain has already been validated',
          WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_ALREADY_VERIFIED,
        ),
      );
    });

    it('should throw an exception if the email does not match the trusted domain', async () => {
      const trustedDomainId = 'trusted-domain-id';
      const sender = {} as User;
      const workspace = {} as Workspace;
      const email = 'validator@different.com';
      const trustedDomain = {
        id: trustedDomainId,
        isValidated: false,
        domain: 'example.com',
      } as WorkspaceTrustedDomain;

      jest
        .spyOn(workspaceTrustedDomainRepository, 'findOneBy')
        .mockResolvedValue(trustedDomain);

      await expect(
        service.sendTrustedDomainValidationEmail(
          sender,
          email,
          workspace,
          trustedDomain,
        ),
      ).rejects.toThrowError(
        new WorkspaceTrustedDomainException(
          'Trusted domain does not match validator email',
          WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_DOES_NOT_MATCH_VALIDATOR_EMAIL,
        ),
      );
    });

    it('should send a validation email if all conditions are met', async () => {
      const sender = {
        email: 'sender@example.com',
        firstName: 'John',
        lastName: 'Doe',
      } as User;
      const workspace = {
        displayName: 'Test Workspace',
        logo: '/logo.png',
      } as Workspace;
      const email = 'validator@custom-domain.com';
      const trustedDomain = {
        isValidated: false,
        domain: 'custom-domain.com',
      } as WorkspaceTrustedDomain;

      jest
        .spyOn(workspaceTrustedDomainRepository, 'findOneBy')
        .mockResolvedValue(trustedDomain);

      jest
        .spyOn(domainManagerService, 'buildWorkspaceURL')
        .mockReturnValue(new URL('https://sub.twenty.com'));

      jest
        .spyOn(environmentService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'EMAIL_FROM_ADDRESS') return 'no-reply@example.com';
          if (key === 'SERVER_URL') return 'https://api.example.com';
        });

      await service.sendTrustedDomainValidationEmail(
        sender,
        email,
        workspace,
        trustedDomain,
      );

      expect(domainManagerService.buildWorkspaceURL).toHaveBeenCalledWith({
        workspace: workspace,
        pathname: 'settings/security',
        searchParams: { validationToken: expect.any(String) },
      });

      expect(emailService.send).toHaveBeenCalledWith({
        from: 'John Doe (via Twenty) <no-reply@example.com>',
        to: email,
        subject: 'Activate Your Trusted Domain',
        text: expect.any(String),
        html: expect.any(String),
      });
    });
  });
});
