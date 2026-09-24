import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { RecordSharingDropdown } from '@/object-record/record-sharing/components/RecordSharingDropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';

const mockRefetch = jest.fn().mockResolvedValue(undefined);
let mockEnabled = true;
jest.mock('@/object-record/record-sharing/hooks/useRecordSharing', () => ({
  useRecordSharing: () => ({
    sharing: { isEnabled: mockEnabled },
    refetch: mockRefetch,
  }),
}));
jest.mock(
  '@/object-record/record-sharing/components/RecordSharingDropdownContent',
  () => ({
    RecordSharingDropdownContent: () => <div>Sharing settings</div>,
  }),
);

it('releases dropdown focus when sharing becomes unavailable and reopens closed', async () => {
  const user = userEvent.setup();
  const store = createStore();
  const dropdownId = 'record-sharing-object-record';
  const component = () => (
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <RecordSharingDropdown
          target={{ objectMetadataId: 'object', recordId: 'record' }}
          title="Share record"
          recordUrl="/record"
        />
      </I18nProvider>
    </Provider>
  );
  const { rerender } = render(component());
  await user.click(screen.getByRole('button', { name: 'Share' }));
  expect(screen.getByText('Sharing settings')).toBeVisible();
  expect(store.get(activeDropdownFocusIdState.atom)).toBe(dropdownId);
  mockEnabled = false;
  rerender(component());
  expect(screen.queryByRole('button', { name: 'Share' })).toBeNull();
  expect(
    store.get(
      isDropdownOpenComponentState.atomFamily({ instanceId: dropdownId }),
    ),
  ).toBe(false);
  expect(store.get(activeDropdownFocusIdState.atom)).not.toBe(dropdownId);
  expect(
    store.get(focusStackState.atom).some((item) => item.focusId === dropdownId),
  ).toBe(false);
  mockEnabled = true;
  rerender(component());
  expect(screen.getByRole('button', { name: 'Share' })).toBeVisible();
  expect(screen.queryByText('Sharing settings')).toBeNull();
});
