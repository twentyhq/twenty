import { Test } from '@nestjs/testing';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const RECORD_ID = '20202020-9b8b-4d9b-a555-9ca96a4fccb1';
const TARGET_OBJECT_IDENTIFIERS = [
  STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
  STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
];

describe('MessageCalendarTargetReadinessService', () => {
  let service: MessageCalendarTargetReadinessService;
  const getOrRecompute = jest.fn();

  const setAvailableTargetObjects = (universalIdentifiers: string[]) => {
    getOrRecompute.mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: Object.fromEntries(
          universalIdentifiers.map((universalIdentifier) => [
            universalIdentifier,
            { universalIdentifier },
          ]),
        ),
      },
    });
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MessageCalendarTargetReadinessService,
        { provide: WorkspaceCacheService, useValue: { getOrRecompute } },
      ],
    }).compile();

    service = module.get(MessageCalendarTargetReadinessService);
    setAvailableTargetObjects(TARGET_OBJECT_IDENTIFIERS);
  });

  it.each([
    ['person', 'targetPersonId'],
    ['company', 'targetCompanyId'],
    ['opportunity', 'targetOpportunityId'],
  ])(
    'uses target reads for %s without a feature flag',
    async (objectNameSingular, fieldName) => {
      await expect(
        service.resolveTargetFilter({
          objectNameSingular,
          recordId: RECORD_ID,
          workspaceId: WORKSPACE_ID,
        }),
      ).resolves.toEqual({ fieldName, recordId: RECORD_ID });
    },
  );

  it.each([
    { name: 'both objects are missing', universalIdentifiers: [] },
    {
      name: 'calendar targets are missing',
      universalIdentifiers: [TARGET_OBJECT_IDENTIFIERS[0]],
    },
    {
      name: 'message targets are missing',
      universalIdentifiers: [TARGET_OBJECT_IDENTIFIERS[1]],
    },
  ])('retains legacy reads when $name', async ({ universalIdentifiers }) => {
    setAvailableTargetObjects(universalIdentifiers);

    await expect(service.isReady(WORKSPACE_ID)).resolves.toBe(false);
  });

  it('retains the related-person fallback for custom objects', async () => {
    await expect(
      service.resolveTargetFilter({
        objectNameSingular: 'pet',
        recordId: RECORD_ID,
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBeUndefined();
  });
});
