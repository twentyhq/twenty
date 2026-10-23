import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { splitApplicationsAroundBuiltInAccountApps } from '@/settings/applications/utils/splitApplicationsAroundBuiltInAccountApps';

const STANDARD_APPLICATION = {
  id: 'standard',
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};
const CUSTOM_APPLICATION = { id: 'custom', universalIdentifier: 'custom' };
const NPM_APPLICATION = { id: 'npm', universalIdentifier: 'npm' };

describe('splitApplicationsAroundBuiltInAccountApps', () => {
  it('puts the standard application before built-in account apps and keeps the others after in order', () => {
    expect(
      splitApplicationsAroundBuiltInAccountApps({
        applications: [
          CUSTOM_APPLICATION,
          STANDARD_APPLICATION,
          NPM_APPLICATION,
        ],
        hasBuiltInAccountApps: true,
      }),
    ).toEqual({
      applicationsBeforeBuiltInAccountApps: [STANDARD_APPLICATION],
      applicationsAfterBuiltInAccountApps: [
        CUSTOM_APPLICATION,
        NPM_APPLICATION,
      ],
    });
  });

  it('keeps every application in its order when there is no built-in account app', () => {
    expect(
      splitApplicationsAroundBuiltInAccountApps({
        applications: [
          CUSTOM_APPLICATION,
          STANDARD_APPLICATION,
          NPM_APPLICATION,
        ],
        hasBuiltInAccountApps: false,
      }),
    ).toEqual({
      applicationsBeforeBuiltInAccountApps: [],
      applicationsAfterBuiltInAccountApps: [
        CUSTOM_APPLICATION,
        STANDARD_APPLICATION,
        NPM_APPLICATION,
      ],
    });
  });
});
