import { MetadataWritability } from '~/generated-metadata/graphql';
import { useGlobalRecordCreationCommandMenuItems } from '@/command-menu-item/hooks/useGlobalRecordCreationCommandMenuItems';
import { mockedCommandMenuItems } from '~/testing/mock-data/generated/metadata/command-menu-items/mock-command-menu-items-data';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

const mockUseIsFeatureEnabled = jest.fn();
const mockUseObjectPermissions = jest.fn();
const mockObjects = [
  { id: 'company', labelSingular: 'company', icon: 'IconBuildingSkyscraper' },
  { id: 'task', labelSingular: 'task', icon: 'IconCheckbox' },
  { id: 'remote', labelSingular: 'remote', isRemote: true },
  { id: 'readonly', labelSingular: 'readonly', isUIEditable: false },
  { id: 'internal', labelSingular: 'internal', isUICreatable: false },
  {
    id: 'system',
    labelSingular: 'system',
    writability: MetadataWritability.SYSTEM,
  },
  {
    id: 'application',
    labelSingular: 'application',
    writability: MetadataWritability.APPLICATION,
  },
].map((objectMetadataItem) => ({
  writability: MetadataWritability.OPEN,
  isUICreatable: true,
  isUIEditable: true,
  isRemote: false,
  ...objectMetadataItem,
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockUseIsFeatureEnabled(),
}));
jest.mock('@/object-metadata/hooks/useFilteredObjectMetadataItems', () => ({
  useFilteredObjectMetadataItems: () => ({
    activeObjectMetadataItems: mockObjects,
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

it('offers every creatable object with its label, icon, and creation target', () => {
  const { result } = renderHook(
    () => useGlobalRecordCreationCommandMenuItems(mockedCommandMenuItems),
    { wrapper },
  );

  expect(result.current.globalRecordCreationCommandMenuItems).toEqual([
    expect.objectContaining({
      label: 'Create Company',
      icon: 'IconBuildingSkyscraper',
      creationTargetObjectMetadataId: 'company',
      isPinned: false,
    }),
    expect.objectContaining({
      label: 'Create Task',
      icon: 'IconCheckbox',
      creationTargetObjectMetadataId: 'task',
      isPinned: false,
    }),
  ]);
  expect(
    new Set(
      result.current.globalRecordCreationCommandMenuItems.map(
        (item) => item.id,
      ),
    ).size,
  ).toBe(2);
});

it('does not offer objects without read or write permissions', () => {
  mockUseObjectPermissions.mockReturnValue({
    objectPermissionsByObjectMetadataId: {
      company: { canUpdateObjectRecords: false },
      task: { canReadObjectRecords: false },
    },
  });
  const { result } = renderHook(
    () => useGlobalRecordCreationCommandMenuItems(mockedCommandMenuItems),
    { wrapper },
  );

  expect(result.current.globalRecordCreationCommandMenuItems).toEqual([]);
});

it('keeps global creation disabled when the form flag is off', () => {
  mockUseIsFeatureEnabled.mockReturnValue(false);
  const { result } = renderHook(
    () => useGlobalRecordCreationCommandMenuItems(mockedCommandMenuItems),
    { wrapper },
  );

  expect(result.current.globalRecordCreationCommandMenuItems).toEqual([]);
});
