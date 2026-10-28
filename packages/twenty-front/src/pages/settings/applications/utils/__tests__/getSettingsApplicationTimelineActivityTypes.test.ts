import { getSettingsApplicationTimelineActivityTypes } from '~/pages/settings/applications/utils/getSettingsApplicationTimelineActivityTypes';

describe('getSettingsApplicationTimelineActivityTypes', () => {
  it('keeps only the installed application activity types', () => {
    expect(
      getSettingsApplicationTimelineActivityTypes({
        applicationId: 'application-1',
        isInstalledApplication: true,
        installedTimelineActivityTypes: [
          {
            applicationId: 'application-1',
            emit: {
              on: 'created',
              objectUniversalIdentifier: 'object-1',
              __typename: 'TimelineActivityTypeEmit',
            },
            icon: 'IconPlus',
            id: 'type-1',
            isActive: false,
            label: 'Was created',
            name: 'record.created',
            universalIdentifier: 'universal-type-1',
            __typename: 'TimelineActivityType',
            frontComponentUniversalIdentifier: null,
          },
          {
            applicationId: 'application-2',
            emit: null,
            icon: null,
            id: 'type-2',
            isActive: true,
            label: 'Was updated',
            name: 'record.updated',
            universalIdentifier: 'universal-type-2',
            __typename: 'TimelineActivityType',
            frontComponentUniversalIdentifier: null,
          },
        ],
        manifestTimelineActivityTypes: [],
      }),
    ).toEqual([
      {
        action: 'created',
        frontComponentUniversalIdentifier: null,
        icon: 'IconPlus',
        id: 'type-1',
        isActive: false,
        label: 'Was created',
        name: 'record.created',
        objectUniversalIdentifier: 'object-1',
        universalIdentifier: 'universal-type-1',
      },
    ]);
  });

  it('maps manifest activity types to read-only preview rows', () => {
    expect(
      getSettingsApplicationTimelineActivityTypes({
        applicationId: 'application-1',
        isInstalledApplication: false,
        installedTimelineActivityTypes: [],
        manifestTimelineActivityTypes: [
          {
            universalIdentifier: 'universal-type-1',
            name: 'rocket.launched',
            label: 'Launched a rocket',
            emit: {
              on: 'created',
              objectUniversalIdentifier: 'object-1',
            },
          },
        ],
      }),
    ).toEqual([
      {
        action: 'created',
        frontComponentUniversalIdentifier: undefined,
        icon: undefined,
        id: 'universal-type-1',
        isActive: true,
        label: 'Launched a rocket',
        name: 'rocket.launched',
        objectUniversalIdentifier: 'object-1',
        universalIdentifier: 'universal-type-1',
      },
    ]);
  });
});
