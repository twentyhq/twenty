import { render, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { AddToFavoritesCommand } from '@/command-menu-item/engine-command/record/components/AddToFavoritesCommand';
import { RemoveFromFavoritesCommand } from '@/command-menu-item/engine-command/record/components/RemoveFromFavoritesCommand';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const mockCreateManyNavigationMenuItems = jest.fn();
const mockDeleteManyNavigationMenuItems = jest.fn();

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => ({
      objectMetadataItem: mockObjectMetadataItem,
      selectedRecords: [
        { id: 'record-1' },
        { id: 'record-2' },
        { id: 'record-3' },
      ],
    }),
  }),
);

jest.mock(
  '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems',
  () => ({
    useCreateManyNavigationMenuItems: () => ({
      createManyNavigationMenuItems: mockCreateManyNavigationMenuItems,
    }),
  }),
);

jest.mock(
  '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems',
  () => ({
    useDeleteManyNavigationMenuItems: () => ({
      deleteManyNavigationMenuItems: mockDeleteManyNavigationMenuItems,
    }),
  }),
);

jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData',
  () => ({
    useNavigationMenuItemsData: () => ({
      currentUserWorkspaceId: 'user-workspace',
      navigationMenuItems: [
        {
          id: 'favorite-2',
          position: 4,
          userWorkspaceId: 'user-workspace',
          targetRecordId: 'record-2',
          targetObjectMetadataId: mockObjectMetadataItem.id,
        },
      ],
      workspaceNavigationMenuItems: [
        {
          id: 'workspace-favorite-2',
          position: 0,
          targetRecordId: 'record-2',
          targetObjectMetadataId: mockObjectMetadataItem.id,
        },
        {
          id: 'workspace-favorite-3',
          position: 1,
          targetRecordId: 'record-3',
          targetObjectMetadataId: mockObjectMetadataItem.id,
        },
      ],
    }),
  }),
);

const renderCommand = (command: ReactNode) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

  return render(command, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Wrapper>
        <CommandComponentInstanceContext.Provider
          value={{ instanceId: 'favorites-command' }}
        >
          {children}
        </CommandComponentInstanceContext.Provider>
      </Wrapper>
    ),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('adds every selected record that is not a favorite yet', async () => {
  renderCommand(<AddToFavoritesCommand />);

  await waitFor(() =>
    expect(mockCreateManyNavigationMenuItems).toHaveBeenCalledWith([
      expect.objectContaining({ targetRecordId: 'record-1', position: 5 }),
      expect.objectContaining({ targetRecordId: 'record-3', position: 6 }),
    ]),
  );
});

it('removes one favorite per selected record, the personal one first', async () => {
  renderCommand(<RemoveFromFavoritesCommand />);

  await waitFor(() =>
    expect(mockDeleteManyNavigationMenuItems).toHaveBeenCalledWith([
      'favorite-2',
      'workspace-favorite-3',
    ]),
  );
});
