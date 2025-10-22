import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { type DeleteResult, type Repository } from 'typeorm';

import { ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import {
  ApprovedAccessDomainException,
  ApprovedAccessDomainExceptionCode,
} from 'src/engine/core-modules/approved-access-domain/approved-access-domain.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { ApprovedAccessDomainService } from './approved-access-domain.service';

// To avoid dynamic import issues in Jest
jest.mock('@react-email/render', () => ({
  render: jest.fn().mockImplementation(async (template, options) => {
    if (options?.plainText) {
      return 'Plain Text Email';
    }

    return '<html><body>HTML email content</body></html>';
  }),
}));

describe('ApprovedAccessDomainService', () => {
  let service: ApprovedAccessDomainService;
  let approvedAccessDomainRepository: Repository<ApprovedAccessDomainEntity>;
  let emailService: EmailService;
  let twentyConfigService: TwentyConfigService;
  let workspaceDomainsService: WorkspaceDomainsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovedAccessDomainService,
        {
          provide: getRepositoryToken(ApprovedAccessDomainEntity),
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
          provide: WorkspaceDomainsService,
          useValue: {
            buildWorkspaceURL: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            signFileUrl: jest
              .fn()
              .mockReturnValue('https://signed-url.com/logo.png'),
          },
        },
      ],
    }).compile();

    service = module.get<ApprovedAccessDomainService>(
      ApprovedAccessDomainService,
    );
    approvedAccessDomainRepository = module.get(
      getRepositoryToken(ApprovedAccessDomainEntity),
    );
    emailService = module.get<EmailService>(EmailService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    workspaceDomainsService = module.get<WorkspaceDomainsService>(
      WorkspaceDomainsService,
    );
  });

  describe('createApprovedAccessDomain', () => {
    it('should successfully create an approved access domain', async () => {
      const domain = 'custom-domain.com';
      const inWorkspace = {
        id: 'workspace-id',
        customDomain: null,
        isCustomDomainEnabled: false,
      } as WorkspaceEntity;
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
          expectedApprovedAccessDomain as unknown as ApprovedAccessDomainEntity,
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
          { id: 'workspace-id' } as WorkspaceEntity,
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
      const workspace: WorkspaceEntity = {
        id: 'workspace-id',
      } as WorkspaceEntity;
      const approvedAccessDomainId = 'approved-access-domain-id';
      const approvedAccessDomainEntity = {
        id: approvedAccessDomainId,
        workspaceId: workspace.id,
      } as ApprovedAccessDomainEntity;

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
      const workspace: WorkspaceEntity = {
        id: 'workspace-id',
      } as WorkspaceEntity;
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
      const workspace = {} as WorkspaceEntity;
      const email = 'validator@example.com';

      const approvedAccessDomain = {
        id: approvedAccessDomainId,
        isValidated: true,
      } as ApprovedAccessDomainEntity;

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
      const workspace = {} as WorkspaceEntity;
      const email = 'validator@different.com';
      const approvedAccessDomain = {
        id: approvedAccessDomainId,
        isValidated: false,
        domain: 'example.com',
      } as ApprovedAccessDomainEntity;

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
        locale: 'en',
      } as WorkspaceMemberWorkspaceEntity;
      const workspace = {
        displayName: 'Test Workspace',
        logo: '/logo.png',
      } as WorkspaceEntity;
      const email = 'validator@custom-domain.com';
      const approvedAccessDomain = {
        isValidated: false,
        domain: 'custom-domain.com',
      } as ApprovedAccessDomainEntity;

      jest
        .spyOn(approvedAccessDomainRepository, 'findOneBy')
        .mockResolvedValue(approvedAccessDomain);

      jest
        .spyOn(workspaceDomainsService, 'buildWorkspaceURL')
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

      expect(workspaceDomainsService.buildWorkspaceURL).toHaveBeenCalledWith({
        workspace: workspace,
        pathname: getSettingsPath(SettingsPath.Domains),
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
      } as ApprovedAccessDomainEntity;

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
      } as ApprovedAccessDomainEntity;

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
      } as ApprovedAccessDomainEntity;

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
