import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { splitApplicationsAroundNativeAccountApps } from '@/settings/applications/utils/splitApplicationsAroundNativeAccountApps';

const STANDARD_APPLICATION = {
  id: 'standard',
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};
const CUSTOM_APPLICATION = { id: 'custom', universalIdentifier: 'custom' };
const NPM_APPLICATION = { id: 'npm', universalIdentifier: 'npm' };

describe('splitApplicationsAroundNativeAccountApps', () => {
  it('puts the standard application before native apps and keeps the others after in order', () => {
    expect(
      splitApplicationsAroundNativeAccountApps({
        applications: [
          CUSTOM_APPLICATION,
          STANDARD_APPLICATION,
          NPM_APPLICATION,
        ],
        hasNativeAccountApps: true,
      }),
    ).toEqual({
      applicationsBeforeNativeAccountApps: [STANDARD_APPLICATION],
      applicationsAfterNativeAccountApps: [CUSTOM_APPLICATION, NPM_APPLICATION],
    });
  });

  it('keeps every application in its order when there is no native app', () => {
    expect(
      splitApplicationsAroundNativeAccountApps({
        applications: [
          CUSTOM_APPLICATION,
          STANDARD_APPLICATION,
          NPM_APPLICATION,
        ],
        hasNativeAccountApps: false,
      }),
    ).toEqual({
      applicationsBeforeNativeAccountApps: [],
      applicationsAfterNativeAccountApps: [
        CUSTOM_APPLICATION,
        STANDARD_APPLICATION,
        NPM_APPLICATION,
      ],
    });
  });
});
