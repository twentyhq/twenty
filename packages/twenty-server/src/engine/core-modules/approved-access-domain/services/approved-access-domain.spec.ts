import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DeleteResult, Repository } from 'typeorm';

import { ApprovedAccessDomain } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import {
  ApprovedAccessDomainException,
  ApprovedAccessDomainExceptionCode,
} from 'src/engine/core-modules/approved-access-domain/approved-access-domain.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { ApprovedAccessDomainService } from './approved-access-domain.service';

describe('ApprovedAccessDomainService', () => {
  let service: ApprovedAccessDomainService;
  let approvedAccessDomainRepository: Repository<ApprovedAccessDomain>;
  let emailService: EmailService;
  let twentyConfigService: TwentyConfigService;
  let domainManagerService: DomainManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovedAccessDomainService,
        {
          provide: getRepositoryToken(ApprovedAccessDomain, 'core'),
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
          provide: TwentyConfigService,
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

    service = module.get<ApprovedAccessDomainService>(
      ApprovedAccessDomainService,
    );
    approvedAccessDomainRepository = module.get(
      getRepositoryToken(ApprovedAccessDomain, 'core'),
    );
    emailService = module.get<EmailService>(EmailService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    domainManagerService =
      module.get<DomainManagerService>(DomainManagerService);
  });

  describe('createApprovedAccessDomain', () => {
    it('should successfully create an approved access domain', async () => {
      const domain = 'custom-domain.com';
      const inWorkspace = {
        id: 'workspace-id',
        customDomain: null,
        isCustomDomainEnabled: false,
      } as Workspace;
      const fromUser = {
        userEmail: 'user@custom-domain.com',
      } as WorkspaceMemberWorkspaceEntity;

      const expectedApprovedAccessDomain = {
        workspaceId: 'workspace-id',
        domain,
        isValidated: true,
      };

      jest
        .spyOn(approvedAccessDomainRepository, 'save')
        .mockResolvedValue(
          expectedApprovedAccessDomain as unknown as ApprovedAccessDomain,
        );

      jest
        .spyOn(service, 'sendApprovedAccessDomainValidationEmail')
        .mockResolvedValue();

      const result = await service.createApprovedAccessDomain(
        domain,
        inWorkspace,
        fromUser,
        'validator@custom-domain.com',
      );

      expect(approvedAccessDomainRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: 'workspace-id',
          domain,
        }),
      );
      expect(result).toEqual(expectedApprovedAccessDomain);
    });
    it('should throw an exception if approved access domain is not a company domain', async () => {
      await expect(
        service.createApprovedAccessDomain(
          'gmail.com',
          { id: 'workspace-id' } as Workspace,
          {
            userEmail: 'user@gmail.com',
          } as WorkspaceMemberWorkspaceEntity,
          'user@gmail.com',
        ),
      ).rejects.toThrowError(
        new ApprovedAccessDomainException(
          'Approved access domain must be a company domain',
          ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_MUST_BE_A_COMPANY_DOMAIN,
        ),
      );
      expect(approvedAccessDomainRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteApprovedAccessDomain', () => {
    it('should delete an approved access domain successfully', async () => {
      const workspace: Workspace = { id: 'workspace-id' } as Workspace;
      const approvedAccessDomainId = 'approved-access-domain-id';
      const approvedAccessDomainEntity = {
        id: approvedAccessDomainId,
        workspaceId: workspace.id,
      } as ApprovedAccessDomain;

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(approvedAccessDomainEntity);
      jest
        .spyOn(approvedAccessDomainRepository, 'delete')
        .mockResolvedValue({} as unknown as DeleteResult);

      await service.deleteApprovedAccessDomain(
        workspace,
        approvedAccessDomainId,
      );

      expect(approvedAccessDomainRepository.findOneBy).toHaveBeenCalledWith({
        id: approvedAccessDomainId,
        workspaceId: workspace.id,
      });
      expect(approvedAccessDomainRepository.delete).toHaveBeenCalledWith({
        id: approvedAccessDomainEntity.id,
      });
    });

    it('should throw an error if the approved access domain does not exist', async () => {
      const workspace: Workspace = { id: 'workspace-id' } as Workspace;
      const approvedAccessDomainId = 'approved-access-domain-id';

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(null);

      await expect(
        service.deleteApprovedAccessDomain(workspace, approvedAccessDomainId),
      ).rejects.toThrow();

      expect(approvedAccessDomainRepository.findOneBy).toHaveBeenCalledWith({
        id: approvedAccessDomainId,
        workspaceId: workspace.id,
      });
      expect(approvedAccessDomainRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('sendApprovedAccessDomainValidationEmail', () => {
    it('should throw an exception if the approved access domain is already validated', async () => {
      const approvedAccessDomainId = 'approved-access-domain-id';
      const sender = {} as WorkspaceMemberWorkspaceEntity;
      const workspace = {} as Workspace;
      const email = 'validator@example.com';

      const approvedAccessDomain = {
        id: approvedAccessDomainId,
        isValidated: true,
      } as ApprovedAccessDomain;

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(approvedAccessDomain);

      await expect(
        service.sendApprovedAccessDomainValidationEmail(
          sender,
          email,
          workspace,
          approvedAccessDomain,
        ),
      ).rejects.toThrowError(
        new ApprovedAccessDomainException(
          'Approved access domain has already been validated',
          ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VERIFIED,
        ),
      );
    });

    it('should throw an exception if the email does not match the approved access domain', async () => {
      const approvedAccessDomainId = 'approved-access-domain-id';
      const sender = {} as WorkspaceMemberWorkspaceEntity;
      const workspace = {} as Workspace;
      const email = 'validator@different.com';
      const approvedAccessDomain = {
        id: approvedAccessDomainId,
        isValidated: false,
        domain: 'example.com',
      } as ApprovedAccessDomain;

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(approvedAccessDomain);

      await expect(
        service.sendApprovedAccessDomainValidationEmail(
          sender,
          email,
          workspace,
          approvedAccessDomain,
        ),
      ).rejects.toThrowError(
        new ApprovedAccessDomainException(
          'Approved access domain does not match email domain',
          ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_DOES_NOT_MATCH_DOMAIN_EMAIL,
        ),
      );
    });

    it('should send a validation email if all conditions are met', async () => {
      const sender = {
        userEmail: 'sender@example.com',
        name: { firstName: 'John', lastName: 'Doe' },
      } as WorkspaceMemberWorkspaceEntity;
      const workspace = {
        displayName: 'Test Workspace',
        logo: '/logo.png',
      } as Workspace;
      const email = 'validator@custom-domain.com';
      const approvedAccessDomain = {
        isValidated: false,
        domain: 'custom-domain.com',
      } as ApprovedAccessDomain;

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(approvedAccessDomain);

      jest
        .spyOn(domainManagerService, 'buildWorkspaceURL')
        .mockReturnValue(new URL('https://sub.twenty.com'));

      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'EMAIL_FROM_ADDRESS') return 'no-reply@example.com';
          if (key === 'SERVER_URL') return 'https://api.example.com';
        });

      await service.sendApprovedAccessDomainValidationEmail(
        sender,
        email,
        workspace,
        approvedAccessDomain,
      );

      expect(domainManagerService.buildWorkspaceURL).toHaveBeenCalledWith({
        workspace: workspace,
        pathname: 'settings/security',
        searchParams: { validationToken: expect.any(String) },
      });

      expect(emailService.send).toHaveBeenCalledWith({
        from: 'John Doe (via Twenty) <no-reply@example.com>',
        to: email,
        subject: 'Approve your access domain',
        text: expect.any(String),
        html: expect.any(String),
      });
    });
  });

  describe('validateApprovedAccessDomain', () => {
    it('should validate the approved access domain successfully with a correct token', async () => {
      const approvedAccessDomainId = 'domain-id';
      const validationToken = 'valid-token';
      const approvedAccessDomain = {
        id: approvedAccessDomainId,
        domain: 'example.com',
        isValidated: false,
      } as ApprovedAccessDomain;

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(approvedAccessDomain);
      jest
        .spyOn(service as any, 'generateUniqueHash')
        .mockReturnValue(validationToken);
      const saveSpy = jest.spyOn(approvedAccessDomainRepository, 'save');

      await service.validateApprovedAccessDomain({
        validationToken,
        approvedAccessDomainId: approvedAccessDomainId,
      });

      expect(approvedAccessDomainRepository.findOneBy).toHaveBeenCalledWith({
        id: approvedAccessDomainId,
      });
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isValidated: true }),
      );
    });

    it('should throw an error if the approved access domain does not exist', async () => {
      const approvedAccessDomainId = 'invalid-domain-id';
      const validationToken = 'valid-token';

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(null);

      await expect(
        service.validateApprovedAccessDomain({
          validationToken,
          approvedAccessDomainId: approvedAccessDomainId,
        }),
      ).rejects.toThrowError(
        new ApprovedAccessDomainException(
          'Approved access domain not found',
          ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_NOT_FOUND,
        ),
      );
    });

    it('should throw an error if the validation token is invalid', async () => {
      const approvedAccessDomainId = 'domain-id';
      const validationToken = 'invalid-token';
      const approvedAccessDomain = {
        id: approvedAccessDomainId,
        domain: 'example.com',
        isValidated: false,
      } as ApprovedAccessDomain;

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(approvedAccessDomain);
      jest
        .spyOn(service as any, 'generateUniqueHash')
        .mockReturnValue('valid-token');

      await expect(
        service.validateApprovedAccessDomain({
          validationToken,
          approvedAccessDomainId: approvedAccessDomainId,
        }),
      ).rejects.toThrowError(
        new ApprovedAccessDomainException(
          'Invalid approved access domain validation token',
          ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_VALIDATION_TOKEN_INVALID,
        ),
      );
    });

    it('should throw an error if the approved access domain is already validated', async () => {
      const approvedAccessDomainId = 'domain-id';
      const validationToken = 'valid-token';
      const approvedAccessDomain = {
        id: approvedAccessDomainId,
        domain: 'example.com',
        isValidated: true,
      } as ApprovedAccessDomain;

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(approvedAccessDomain);

      await expect(
        service.validateApprovedAccessDomain({
          validationToken,
          approvedAccessDomainId: approvedAccessDomainId,
        }),
      ).rejects.toThrowError(
        new ApprovedAccessDomainException(
          'Approved access domain has already been validated',
          ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_VALIDATED,
        ),
      );
    });
  });
});
