import { Action } from '@/action-menu/actions/components/Action';
import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { msg } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
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
}): ActionConfig[] => [
  {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.ADD_TO_FAVORITES,
    label: msg`Add to favorites`,
    shortLabel: msg`Add to favorites`,
    position: 2,
    isPinned: true,
    Icon: IconHeart,
    shouldBeRegistered: () => true,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: <Action onClick={addToFavoritesMock} />,
  },
  {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX,
    label: msg`Export`,
    shortLabel: msg`Export`,
    position: 4,
    Icon: IconFileExport,
    accent: 'default',
    isPinned: false,
    shouldBeRegistered: () => true,
    availableOn: [ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION],
    component: <Action onClick={exportMock} />,
  },
  {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: SingleRecordActionKeys.DELETE,
    label: msg`Delete`,
    shortLabel: msg`Delete`,
    position: 7,
    Icon: IconTrash,
    accent: 'default',
    isPinned: true,
    shouldBeRegistered: () => true,
    availableOn: [
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    component: <Action onClick={deleteMock} />,
  },
  {
    type: ActionType.Navigation,
    scope: ActionScope.Global,
    key: NoSelectionRecordActionKeys.GO_TO_PEOPLE,
    label: msg`Go to People`,
    shortLabel: msg`People`,
    position: 19,
    Icon: IconUser,
    isPinned: false,
    availableOn: [
      ActionViewType.INDEX_PAGE_NO_SELECTION,
      ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
      ActionViewType.INDEX_PAGE_BULK_SELECTION,
      ActionViewType.SHOW_PAGE,
    ],
    shouldBeRegistered: ({ objectMetadataItem, viewType }) =>
      objectMetadataItem?.nameSingular !== CoreObjectNameSingular.Person ||
      viewType === ActionViewType.SHOW_PAGE,
    component: (
      <ActionLink
        to={AppPath.RecordIndexPage}
        params={{ objectNamePlural: CoreObjectNamePlural.Person }}
      />
    ),
    hotKeys: ['G', 'P'],
  },
];
