import { msg } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import {
  IconFileExport,
  IconHeart,
  IconTrash,
  IconUser,
} from 'twenty-ui/display';

import { Command } from '@/command-menu-item/display/components/Command';
import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { EngineComponentKey } from '~/generated-metadata/graphql';
import { getAppPath } from 'twenty-shared/utils';

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
    key: EngineComponentKey.ADD_TO_FAVORITES,
    label: msg`Add to favorites`,
    shortLabel: msg`Add to favorites`,
    position: 2,
    isPinned: true,
    Icon: IconHeart,
    component: <Command onClick={addToFavoritesMock} />,
  },
  {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: EngineComponentKey.EXPORT_FROM_RECORD_INDEX,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 4,
    Icon: IconFileExport,
    isPinned: false,
    component: <Command onClick={exportMock} />,
  },
  {
    type: CommandMenuItemType.Standard,
    scope: CommandMenuItemScope.RecordSelection,
    key: EngineComponentKey.DELETE_SINGLE_RECORD,
    label: msg`Delete`,
    shortLabel: msg`Delete`,
    position: 7,
    Icon: IconTrash,
    isPinned: true,
    component: <Command onClick={deleteMock} />,
  },
  {
    type: CommandMenuItemType.Navigation,
    scope: CommandMenuItemScope.Global,
    key: EngineComponentKey.GO_TO_PEOPLE,
    label: msg`Go to People`,
    shortLabel: msg`People`,
    position: 19,
    Icon: IconUser,
    isPinned: false,
    component: (
      <CommandMenuItemDisplay
        to={getAppPath(AppPath.RecordIndexPage, {
          objectNamePlural: CoreObjectNamePlural.Person,
        })}
      />
    ),
    hotKeys: ['G', 'P'],
  },
];
