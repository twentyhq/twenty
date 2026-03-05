import { Action } from '@/action-menu/actions/components/Action';
import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { type CommandMenuItemConfig } from '@/action-menu/actions/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/action-menu/actions/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/action-menu/actions/types/CommandMenuItemType';
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

export const createMockActionMenuActions = ({
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
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
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
    component: <Action onClick={addToFavoritesMock} />,
  },
  {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 4,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [CommandMenuItemViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION],
    component: <Action onClick={exportMock} />,
  },
  {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: SingleRecordActionKeys.DELETE,
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
    component: <Action onClick={deleteMock} />,
  },
  {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_PEOPLE,
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
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Person }}
      />
    ),
    hotKeys: ['G', 'P'],
  },
];
