import { Test } from '@nestjs/testing';
import {
  MetadataReadability,
  RecordShareRowCause,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { RecordShareService } from 'src/engine/core-modules/record-share/services/record-share.service';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const setup = async ({
  rowCause,
  legacyOpen = false,
}: { rowCause?: RecordShareRowCause; legacyOpen?: boolean } = {}) => {
  const module = await Test.createTestingModule({
    providers: [
      RecordAccessPolicyService,
      { provide: WorkspaceOrmManager, useValue: {} },
      { provide: WorkspaceCacheService, useValue: {} },
      {
        provide: RecordSharingFeatureService,
        useValue: {
          isLegacyRecordAccessOpen: jest.fn().mockResolvedValue(legacyOpen),
        },
      },
      {
        provide: RecordShareService,
        useValue: {
          findByRecordIds: jest.fn().mockResolvedValue(
            rowCause
              ? [
                  {
                    recordId: 'record',
                    principalId: 'member',
                    rowCause,
                    accessLevel: RecordShareAccessLevel.FULL,
                  },
                ]
              : [],
          ),
        },
      },
    ],
  }).compile();
  const gate = (readability: MetadataReadability) =>
    module.get(RecordAccessPolicyService).buildEventRecordAccessGate({
      name: 'company.created',
      workspaceId: COMPANY_FLAT_OBJECT_MOCK.workspaceId,
      objectMetadata: { ...COMPANY_FLAT_OBJECT_MOCK, readability },
      events: [{ recordId: 'record', properties: { after: { id: 'record' } } }],
    });
  return { module, gate };
};

const subject = {
  objectsPermissions: undefined,
  principalIds: ['member'],
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};

describe('mandatory event visibility', () => {
  it.each([true, false])(
    'denies SYSTEM records with owning application=%s',
    async (isOwningApplication) => {
      const { module, gate } = await setup();
      expect(
        await gate(MetadataReadability.SYSTEM).resolveAdmittedRecordIds({
          ...subject,
          isOwningApplication: () => isOwningApplication,
        }),
      ).toEqual(new Set());
      await module.close();
    },
  );

  it.each([
    RecordShareRowCause.OWNER,
    RecordShareRowCause.APPLICATION,
    RecordShareRowCause.MANUAL,
  ])('honors %s grants after metadata activation', async (rowCause) => {
    const { module, gate } = await setup({ rowCause });
    expect(
      await gate(MetadataReadability.PRIVATE).resolveAdmittedRecordIds(subject),
    ).toEqual(new Set(['record']));
    await module.close();
  });

  it.each([true, false])(
    'uses the resolved legacy-access decision (%s) for unshared events',
    async (legacyOpen) => {
      const { module, gate } = await setup({ legacyOpen });
      expect(
        await gate(MetadataReadability.PRIVATE).resolveAdmittedRecordIds(
          subject,
        ),
      ).toEqual(new Set(legacyOpen ? ['record'] : []));
      await module.close();
    },
  );
});
