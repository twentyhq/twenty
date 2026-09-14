import { useGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/hooks/useGlobalRecordCreationCommandMenuItems';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockUseIsFeatureEnabled = jest.fn();
const mockUseObjectPermissions = jest.fn();
const mockCompany = getMockObjectMetadataItemOrThrow('company');

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockUseIsFeatureEnabled(),
}));
jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    activeObjectMetadataItems: [mockCompany],
  }),
}));
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => mockUseObjectPermissions(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

beforeEach(() => {
  i18n.loadAndActivate({ locale: 'en', messages: {} });
  mockUseIsFeatureEnabled.mockReturnValue(true);
  mockUseObjectPermissions.mockReturnValue({
    objectPermissionsByObjectMetadataId: {},
  });
});

it('builds localized commands when the form flag is enabled', () => {
  const { result } = renderHook(
    () => useGlobalRecordCreationCommandMenuItems(mockedCommandMenuItems),
    { wrapper },
  );

  expect(result.current.globalRecordCreationCommandMenuItems).toEqual([
    expect.objectContaining({
      label: 'Create Company',
      creationTargetObjectMetadataId: mockCompany.id,
    }),
  ]);
});

it('keeps global creation disabled when the form flag is off', () => {
  mockUseIsFeatureEnabled.mockReturnValue(false);
  const { result } = renderHook(
    () => useGlobalRecordCreationCommandMenuItems(mockedCommandMenuItems),
    { wrapper },
  );

  expect(result.current.globalRecordCreationCommandMenuItems).toEqual([]);
});
