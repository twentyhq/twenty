import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemAlreadyInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAlreadyInSection';

const COMPANIES_OBJECT_METADATA_ID = 'companies-object-metadata-id';

const items = [
  { id: 'sales-tab', type: NavigationMenuItemType.TAB, folderId: null },
  {
    id: 'pipeline',
    type: NavigationMenuItemType.SECTION,
    folderId: 'sales-tab',
  },
  {
    id: 'pipeline-companies',
    type: NavigationMenuItemType.OBJECT,
    folderId: 'pipeline',
    targetObjectMetadataId: COMPANIES_OBJECT_METADATA_ID,
  },
  {
    id: 'pipeline-companies-view',
    type: NavigationMenuItemType.VIEW,
    folderId: 'pipeline',
    viewId: 'all-companies-view-id',
  },
  { id: 'support-tab', type: NavigationMenuItemType.TAB, folderId: null },
  {
    id: 'accounts',
    type: NavigationMenuItemType.SECTION,
    folderId: 'support-tab',
  },
  {
    id: 'accounts-companies',
    type: NavigationMenuItemType.OBJECT,
    folderId: 'accounts',
    targetObjectMetadataId: COMPANIES_OBJECT_METADATA_ID,
  },
  {
    id: 'key-accounts',
    type: NavigationMenuItemType.FOLDER,
    folderId: 'accounts',
  },
  {
    id: 'escalations',
    type: NavigationMenuItemType.SECTION,
    folderId: 'support-tab',
  },
  {
    id: 'escalated',
    type: NavigationMenuItemType.FOLDER,
    folderId: 'escalations',
  },
  {
    id: 'escalated-companies',
    type: NavigationMenuItemType.OBJECT,
    folderId: 'escalated',
    targetObjectMetadataId: COMPANIES_OBJECT_METADATA_ID,
  },
  {
    id: 'onboarding',
    type: NavigationMenuItemType.SECTION,
    folderId: 'support-tab',
  },
];

describe('isNavigationMenuItemAlreadyInSection', () => {
  it.each([
    {
      move: 'Companies into a section of another tab without it',
      itemId: 'pipeline-companies',
      containerId: 'onboarding',
      expected: false,
    },
    {
      move: 'Companies into a section that has it',
      itemId: 'pipeline-companies',
      containerId: 'accounts',
      expected: true,
    },
    {
      move: 'Companies into a folder of a section that has it',
      itemId: 'pipeline-companies',
      containerId: 'key-accounts',
      expected: true,
    },
    {
      move: 'Companies into a folder of its own section',
      itemId: 'accounts-companies',
      containerId: 'key-accounts',
      expected: false,
    },
    {
      move: 'a folder holding Companies into a section that has it',
      itemId: 'escalated',
      containerId: 'accounts',
      expected: true,
    },
    {
      move: 'a folder holding Companies into a section without it',
      itemId: 'escalated',
      containerId: 'onboarding',
      expected: false,
    },
    {
      move: 'a Companies view into a section that has the Companies object',
      itemId: 'pipeline-companies-view',
      containerId: 'accounts',
      expected: false,
    },
  ])(
    'moving $move duplicates it: $expected',
    ({ itemId, containerId, expected }) => {
      expect(
        isNavigationMenuItemAlreadyInSection({ items, itemId, containerId }),
      ).toBe(expected);
    },
  );
});
