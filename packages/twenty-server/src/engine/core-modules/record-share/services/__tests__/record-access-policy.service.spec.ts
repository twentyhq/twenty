import { Test } from '@nestjs/testing';
import { MetadataReadability } from 'twenty-shared/types';

import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordShareService } from 'src/engine/core-modules/record-share/services/record-share.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
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
    async (sharingEnabled, owningApplication) => {
      const module = await Test.createTestingModule({
        providers: [
          RecordAccessPolicyService,
          { provide: WorkspaceOrmManager, useValue: {} },
          { provide: WorkspaceCacheService, useValue: {} },
          { provide: RecordShareService, useValue: {} },
          {
            provide: RecordSharingFeatureService,
            useValue: {
              isRecordSharingEnabled: jest
                .fn()
                .mockResolvedValue(sharingEnabled),
            },
          },
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
          objectsPermissions: undefined,
          principalIds: ['everyone'],
          isOwningApplication: () => owningApplication,
          resolveRowLevelPermissionRecordFilter: () => null,
        }),
      ).toEqual(new Set());
      await module.close();
    },
  );
});
