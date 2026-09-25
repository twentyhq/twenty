import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { type Manifest } from 'twenty-shared/application';

import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';
import { SettingsApplicationDetailContentTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailContentTab';

jest.mock('@/applications/components/AppChip', () => ({
  AppChip: () => <div data-testid="app-chip" />,
}));

jest.mock(
  '@/settings/applications/hooks/useComputeObjectAndFieldsContentForApplication',
  () => ({
    useComputeObjectAndFieldsContentForApplication: () => ({
      objectRows: [],
      fieldRows: [],
    }),
  }),
);

jest.mock(
  '@/settings/applications/hooks/useComputeApplicationContentForLayoutAndLogic',
  () => ({
    useComputeApplicationContentForLayoutAndLogic: () => ({
      pageLayoutRows: [],
      viewRows: [],
      navigationMenuItemRows: [],
      agentRows: [],
      skillRows: [],
      roleRows: [],
      connectionProviderRows: [],
    }),
  }),
);

jest.mock(
  '~/pages/settings/applications/hooks/useInstalledTimelineActivityTypes',
  () => ({
    useInstalledTimelineActivityTypes: () => ({
      installedTimelineActivityTypes: [],
      loading: false,
    }),
  }),
);

const manifestContent = {
  commandMenuItems: [
    {
      universalIdentifier: 'open-route-field',
      label: 'Open route',
      availabilityType: CommandMenuItemAvailabilityType.RECORD_FIELD,
    },
    {
      universalIdentifier: 'open-route-selection',
      label: 'Open route from selection',
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    },
  ],
} as unknown as Manifest;

const getSubtableRowNames = (title: string) =>
  within(
    screen.getByText(title).parentElement?.nextElementSibling as HTMLElement,
  )
    .queryAllByText(/^Open route/)
    .map((element) => element.textContent);

describe('SettingsApplicationDetailContentTab', () => {
  it('lists record field items as field buttons, apart from the command menu items', () => {
    render(
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsApplicationDetailContentTab
            applicationId="application-id"
            manifestContent={manifestContent}
            applicationInfo={{ name: 'Field actions' }}
          />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(getSubtableRowNames('Field buttons')).toEqual(['Open route']);
    expect(getSubtableRowNames('Command menu items')).toEqual([
      'Open route from selection',
    ]);
  });
});
