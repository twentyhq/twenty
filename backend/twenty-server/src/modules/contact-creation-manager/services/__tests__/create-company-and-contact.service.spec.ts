import { Test, type TestingModule } from '@nestjs/testing';

import { FieldActorSource } from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CreateCompanyAndPersonService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreatePersonService } from 'src/modules/contact-creation-manager/services/create-person.service';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('CreateCompanyAndPersonService', () => {
  let service: CreateCompanyAndPersonService;

  const mockConnectedAccount = {
    id: 'connected-account-1',
    accountOwner: {
      id: 'workspace-member-1',
    },
  } as unknown as ConnectedAccountWorkspaceEntity;

  beforeEach(async () => {
    const mockCreateCompaniesService = {
      createOrRestoreCompanies: jest.fn(),
    };
    const mockCreatePersonService = {
      restorePeople: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompanyAndPersonService,
        {
          provide: CreateCompanyService,
          useValue: mockCreateCompaniesService,
        },
        {
          provide: CreatePersonService,
          useValue: mockCreatePersonService,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {},
        },
        {
          provide: ExceptionHandlerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CreateCompanyAndPersonService>(
      CreateCompanyAndPersonService,
    );
  });

  describe('computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate', () => {
    const mockContacts: Contact[] = [
      {
        handle: 'john.doe@company.com',
        displayName: 'John Doe',
      },
      {
        handle: 'jane.smith@company.com',
        displayName: 'Jane Smith',
      },
      {
        handle: 'personal@email.com',
        displayName: 'Personal Contact',
      },
    ];

    const mockExistingPeople: PersonWorkspaceEntity[] = [
      {
        id: 'soft-deleted-person-1',
        emails: {
          primaryEmail: 'john.doe@company.com',
          additionalEmails: null,
        },
        deletedAt: new Date(),
      } as unknown as PersonWorkspaceEntity,
      {
        id: 'soft-deleted-person-2',
        emails: {
          primaryEmail: 'different@company.com',
          additionalEmails: ['jane.smith@company.com'],
        },
        deletedAt: new Date(),
      } as unknown as PersonWorkspaceEntity,
      {
        id: 'active-person-3',
        emails: {
          primaryEmail: 'active@company.com',
          additionalEmails: null,
        },
        deletedAt: null,
      } as unknown as PersonWorkspaceEntity,
    ];

    it('should identify contacts that need person creation for new contacts', () => {
      const result =
        service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
          mockContacts,
          mockExistingPeople,
          FieldActorSource.CALENDAR,
          mockConnectedAccount,
        );

      expect(result.contactsThatNeedPersonCreate).toHaveLength(1);
      expect(result.contactsThatNeedPersonCreate[0].handle).toBe(
        'personal@email.com',
      );
    });

    it('should identify contacts that need person restoration for soft-deleted contacts', () => {
      const result =
        service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
          mockContacts,
          mockExistingPeople,
          FieldActorSource.CALENDAR,
          mockConnectedAccount,
        );

      expect(result.contactsThatNeedPersonRestore).toHaveLength(2);
      expect(
        result.contactsThatNeedPersonRestore.map((c) => c.handle),
      ).toContain('john.doe@company.com');
      expect(
        result.contactsThatNeedPersonRestore.map((c) => c.handle),
      ).toContain('jane.smith@company.com');
    });
  });
});
