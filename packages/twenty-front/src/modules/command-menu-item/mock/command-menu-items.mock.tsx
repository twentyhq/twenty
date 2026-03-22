import { Command } from '@/command-menu-item/display/components/Command';
import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import {
  CommandMenuItemViewType,
  CoreObjectNameSingular,
  AppPath,
} from 'twenty-shared/types';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { msg } from '@lingui/core/macro';
import {
  IconFileExport,
  IconHeart,
  IconTrash,
  IconUser,
} from 'twenty-ui/display';

export const createMockCommandMenuItems = ({
  deleteMock = () => {},
  addToFavoritesMock = () => {},
  exportMock = () => {},
}: {
  deleteMock?: () => void;
  addToFavoritesMock?: () => void;
  exportMock?: () => void;
}): CommandMenuItemConfig[] => [
  {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.ADD_TO_FAVORITES,
    label: msg`Add to favorites`,
    shortLabel: msg`Add to favorites`,
    position: 2,
    isPinned: true,
    Icon: IconHeart,
    shouldBeRegistered: () => true,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    component: <Command onClick={addToFavoritesMock} />,
  },
  {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.EXPORT_FROM_RECORD_INDEX,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 4,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION],
    component: <Command onClick={exportMock} />,
  },
  {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordCommandKeys.DELETE,
    label: msg`Delete`,
    shortLabel: msg`Delete`,
    position: 7,
    Icon: IconTrash,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: () => true,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    component: <Command onClick={deleteMock} />,
  },
  {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordCommandKeys.GO_TO_PEOPLE,
    label: msg`Go to People`,
    shortLabel: msg`People`,
    position: 19,
    Icon: IconUser,
    isPinned: false,
    availableOn: [
      CommandMenuItemViewType.INDEX_PAGE_NO_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      CommandMenuItemViewType.INDEX_PAGE_BULK_SELECTION,
      CommandMenuItemViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({ objectMetadataItem, viewType }) =>
      objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Person ||
      viewType === CommandMenuItemViewType.SHOW_PAGE,
    component: (
      <CommandLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Person }}
      />
    ),
    hotKeys: ['G', 'P'],
  },
];
