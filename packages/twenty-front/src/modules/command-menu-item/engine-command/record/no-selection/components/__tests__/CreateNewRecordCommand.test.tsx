import { act, render } from '@testing-library/react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CreateNewRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewRecordCommand';
import { SidePanelPages } from 'twenty-shared/types';

const mockExecute = jest.fn();
const mockNavigateSidePanelMenu = jest.fn();
const mockStoreSet = jest.fn();
const mockIcon = jest.fn(() => null);
const mockGetIcon = jest.fn(() => mockIcon);
const mockCreateNewIndexRecordNoSelectionRecordCommand = jest.fn(() => null);
let mockPayload: unknown;
let mockObjectMetadataItems: EnrichedObjectMetadataItem[] = [];

jest.mock(
  '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect',
  () => ({
    HeadlessEngineCommandWrapperEffect: ({
      execute,
    }: {
      execute: () => void | Promise<unknown>;
    }) => {
      mockExecute(execute);

      return null;
    },
  }),
);

jest.mock(
  '@/command-menu-item/engine-command/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand',
  () => ({
    CreateNewIndexRecordNoSelectionRecordCommand: () =>
      mockCreateNewIndexRecordNoSelectionRecordCommand(),
  }),
);

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => ({
      payload: mockPayload,
    }),
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: mockObjectMetadataItems,
  }),
}));

jest.mock('@/object-metadata/utils/getObjectColorWithFallback', () => ({
  getObjectColorWithFallback: () => 'turquoise',
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
  }),
}));

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useStore: () => ({
    set: mockStoreSet,
  }),
}));

jest.mock('twenty-ui/display', () => ({
  getIconTileColorShades: () => ({
    iconColor: 'icon-color',
  }),
  useIcons: () => ({
    getIcon: mockGetIcon,
  }),
}));

const shipObjectMetadataItem = {
  id: 'ship-object-metadata-id',
  nameSingular: 'ship',
  labelSingular: 'Ship',
  icon: 'IconShip',
  isActive: true,
  isSystem: false,
} as EnrichedObjectMetadataItem;

describe('CreateNewRecordCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPayload = {
      __typename: 'ObjectMetadataCommandMenuItemPayload',
      objectMetadataItemId: shipObjectMetadataItem.id,
    };
    mockObjectMetadataItems = [shipObjectMetadataItem];
  });

  it('keeps the current index create behavior when payload is null', () => {
    mockPayload = null;

    render(<CreateNewRecordCommand />);

    expect(
      mockCreateNewIndexRecordNoSelectionRecordCommand,
    ).toHaveBeenCalledTimes(1);
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('opens the create record side panel page for object metadata payloads', () => {
    render(<CreateNewRecordCommand />);

    const execute = mockExecute.mock.calls[0]?.[0];

    expect(execute).toBeDefined();

    act(() => {
      execute?.();
    });

    expect(mockStoreSet).toHaveBeenCalledWith(
      expect.anything(),
      shipObjectMetadataItem.id,
    );
    expect(mockNavigateSidePanelMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.CreateRecord,
        pageTitle: 'New Ship',
        pageIcon: mockIcon,
        pageIconColor: 'icon-color',
        pageId: expect.any(String),
      }),
    );
  });
});
