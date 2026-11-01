import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { consolidateUsageByApplication } from 'src/engine/core-modules/usage/utils/consolidate-usage-by-application.util';

const buildFlatApplicationMaps = (
  applications: Array<Partial<FlatApplication> & { id: string }>,
): FlatApplicationCacheMaps => ({
  byId: Object.fromEntries(
    applications.map((application) => [
      application.id,
      application as FlatApplication,
    ]),
  ),
  idByUniversalIdentifier: {},
});

describe('consolidateUsageByApplication', () => {
  it('should give each declared operation its own slice under the app name', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-1',
          operation: 'recordMeeting',
          creditsUsed: 500,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 500,
        },
        {
          applicationId: 'app-1',
          operation: 'summarizeMeeting',
          creditsUsed: 300,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 300,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        {
          id: 'app-1',
          name: 'Call Recorder',
          billing: {
            operations: {
              recordMeeting: {
                operationType: 'CALL_RECORDING',
                label: 'Meeting recording',
              },
              summarizeMeeting: {
                operationType: 'AI_CHAT_TOKEN',
                label: 'Meeting summary',
              },
            },
          },
        },
      ]),
    });

    expect(result).toEqual([
      {
        key: 'Call Recorder · Meeting recording',
        label: 'Call Recorder · Meeting recording',
        creditsUsed: 500,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 500,
      },
      {
        key: 'Call Recorder · Meeting summary',
        label: 'Call Recorder · Meeting summary',
        creditsUsed: 300,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 300,
      },
    ]);
  });

  it('should give each declared recurring charge its own slice', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-1',
          operation: 'seat',
          creditsUsed: 50,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 50,
        },
        {
          applicationId: 'app-1',
          operation: 'platformFee',
          creditsUsed: 20,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 20,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        {
          id: 'app-1',
          name: 'Call Recorder',
          billing: {
            recurring: {
              seat: {
                period: 'MONTH',
                amountMicroCredits: 10_000_000,
                per: 'WORKSPACE_MEMBER',
                label: 'Per member',
              },
              platformFee: {
                period: 'MONTH',
                amountMicroCredits: 20_000_000,
                label: 'Platform fee',
              },
            },
          },
        },
      ]),
    });

    expect(result).toEqual([
      {
        key: 'Call Recorder · Per member',
        label: 'Call Recorder · Per member',
        creditsUsed: 50,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 50,
      },
      {
        key: 'Call Recorder · Platform fee',
        label: 'Call Recorder · Platform fee',
        creditsUsed: 20,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 20,
      },
    ]);
  });

  it('should fold undeclared operations into a single app-level slice', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-1',
          operation: 'pdl/person',
          creditsUsed: 100,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 100,
        },
        {
          applicationId: 'app-1',
          operation: 'pdl/company',
          creditsUsed: 70,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 70,
        },
        {
          applicationId: 'app-1',
          operation: '',
          creditsUsed: 40,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 40,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        { id: 'app-1', name: 'People Data Labs', billing: {} },
      ]),
    });

    expect(result).toEqual([
      {
        key: 'People Data Labs',
        label: 'People Data Labs',
        creditsUsed: 210,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 210,
      },
    ]);
  });

  it('should keep an uninstalled application in the breakdown under its name', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-1',
          operation: '',
          creditsUsed: 120,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 120,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        {
          id: 'app-1',
          name: 'Retired App',
          billing: {},
          deletedAt: new Date('2026-08-01T00:00:00.000Z'),
        },
      ]),
    });

    expect(result).toEqual([
      {
        key: 'Retired App',
        label: 'Retired App',
        creditsUsed: 120,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 120,
      },
    ]);
  });

  it('should fall back to the application id when the application is unknown', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-gone',
          operation: '',
          creditsUsed: 90,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 90,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([]),
    });

    expect(result).toEqual([
      {
        key: 'app-gone',
        label: 'app-gone',
        creditsUsed: 90,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 90,
      },
    ]);
  });

  it('should merge two applications sharing a display name into one slice', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-1',
          operation: '',
          creditsUsed: 60,
          userCreditsUsed: 20,
          workspaceCreditsUsed: 40,
        },
        {
          applicationId: 'app-2',
          operation: '',
          creditsUsed: 25,
          userCreditsUsed: 5,
          workspaceCreditsUsed: 20,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        { id: 'app-1', name: 'Enricher', billing: {} },
        { id: 'app-2', name: 'Enricher', billing: {} },
      ]),
    });

    expect(result).toEqual([
      {
        key: 'Enricher',
        label: 'Enricher',
        creditsUsed: 85,
        userCreditsUsed: 25,
        workspaceCreditsUsed: 60,
      },
    ]);
  });

  it('should order slices by credits descending after merging', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-1',
          operation: '',
          creditsUsed: 10,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 10,
        },
        {
          applicationId: 'app-2',
          operation: '',
          creditsUsed: 400,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 400,
        },
        {
          applicationId: 'app-1',
          operation: 'undeclared',
          creditsUsed: 50,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 50,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        { id: 'app-1', name: 'Small', billing: {} },
        { id: 'app-2', name: 'Large', billing: {} },
      ]),
    });

    expect(result).toEqual([
      {
        key: 'Large',
        label: 'Large',
        creditsUsed: 400,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 400,
      },
      {
        key: 'Small',
        label: 'Small',
        creditsUsed: 60,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 60,
      },
    ]);
  });

  it('should order slices by workspace credits, not by total credits', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-1',
          operation: '',
          creditsUsed: 100,
          userCreditsUsed: 90,
          workspaceCreditsUsed: 10,
        },
        {
          applicationId: 'app-2',
          operation: '',
          creditsUsed: 50,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 50,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        { id: 'app-1', name: 'Mostly user credits', billing: {} },
        { id: 'app-2', name: 'Workspace credits', billing: {} },
      ]),
    });

    expect(result.map((item) => item.key)).toEqual([
      'Workspace credits',
      'Mostly user credits',
    ]);
  });

  // billing is hidden from TypeORM until its upgrade has run.
  it('should treat a missing billing column as no declarations', () => {
    const result = consolidateUsageByApplication({
      items: [
        {
          applicationId: 'app-1',
          operation: 'recordMeeting',
          creditsUsed: 75,
          userCreditsUsed: 0,
          workspaceCreditsUsed: 75,
        },
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        { id: 'app-1', name: 'Call Recorder' },
      ]),
    });

    expect(result).toEqual([
      {
        key: 'Call Recorder',
        label: 'Call Recorder',
        creditsUsed: 75,
        userCreditsUsed: 0,
        workspaceCreditsUsed: 75,
      },
    ]);
  });

  it('should return an empty breakdown when there is no usage', () => {
    expect(
      consolidateUsageByApplication({
        items: [],
        flatApplicationMaps: buildFlatApplicationMaps([]),
      }),
    ).toEqual([]);
  });
});
