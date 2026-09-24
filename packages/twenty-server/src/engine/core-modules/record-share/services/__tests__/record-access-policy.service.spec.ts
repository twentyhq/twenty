import { Test } from '@nestjs/testing';
import {
  MetadataReadability,
  RecordShareRowCause,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('mandatory event visibility', () => {
  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])(
    'denies SYSTEM records with sharing=%s and owning application=%s',
    async (_sharingEnabled, owningApplication) => {
      const module = await Test.createTestingModule({
        providers: [
          RecordAccessPolicyService,
          { provide: WorkspaceOrmManager, useValue: {} },
          { provide: WorkspaceCacheService, useValue: {} },
          { provide: RecordShareStorageService, useValue: {} },
        ],
      }).compile();
      const service = module.get(RecordAccessPolicyService);
      const gate = service.buildEventRecordAccessGate({
        name: 'company.created',
        workspaceId: COMPANY_FLAT_OBJECT_MOCK.workspaceId,
        objectMetadata: {
          ...COMPANY_FLAT_OBJECT_MOCK,
          readability: MetadataReadability.SYSTEM,
        },
        events: [
          {
            recordId: 'private-record',
            properties: { after: { id: 'private-record' } },
          },
        ],
      });

      expect(
        await gate.resolveAdmittedRecordIds({
          isSystemContext: false,
          objectsPermissions: undefined,
          principalIds: ['everyone'],
          isOwningApplication: () => owningApplication,
          resolveRowLevelPermissionRecordFilter: () => null,
        }),
      ).toEqual(new Set());
      await module.close();
    },
  );
  it.each([
    RecordShareRowCause.OWNER,
    RecordShareRowCause.APPLICATION,
    RecordShareRowCause.MANUAL,
  ])(
    'keeps SQL-equivalent event access for %s grants when the sharing UI is disabled',
    async (rowCause) => {
      const service = new RecordAccessPolicyService(
        {} as never,
        {
          getOrRecompute: jest.fn().mockResolvedValue({
            flatObjectMetadataMaps: { byUniversalIdentifier: {} },
            featureFlagsMap: {},
            billingEntitlements: {},
          }),
        } as never,
        {
          findByRecordIds: jest.fn().mockResolvedValue([
            {
              recordId: 'private-record',
              principalId: 'member',
              rowCause,
              accessLevel: RecordShareAccessLevel.FULL,
            },
          ]),
        } as never,
      );
      const gate = service.buildEventRecordAccessGate({
        name: 'company.created',
        workspaceId: COMPANY_FLAT_OBJECT_MOCK.workspaceId,
        objectMetadata: {
          ...COMPANY_FLAT_OBJECT_MOCK,
          readability: MetadataReadability.PRIVATE,
        },
        events: [
          {
            recordId: 'private-record',
            properties: { after: { id: 'private-record' } },
          },
        ],
      });
      const ids = await gate.resolveAdmittedRecordIds({
        isSystemContext: false,
        objectsPermissions: undefined,
        principalIds: ['member'],
        isOwningApplication: () => false,
        resolveRowLevelPermissionRecordFilter: () => null,
      });
      expect(ids).toEqual(new Set(['private-record']));
    },
  );
});
