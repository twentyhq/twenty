import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { msg } from '@lingui/core/macro';

export const VIEW_PICKER_TYPE_SELECT_OPTIONS = [
  {
    value: ViewType.TABLE,
    label: msg`Table`,
    Icon: viewTypeIconMapping(ViewType.TABLE),
  },
  {
    value: ViewType.KANBAN,
    label: msg`Kanban`,
    Icon: viewTypeIconMapping(ViewType.KANBAN),
  },
  {
    value: ViewType.CALENDAR,
    label: msg`Calendar`,
    Icon: viewTypeIconMapping(ViewType.CALENDAR),
  },
];
