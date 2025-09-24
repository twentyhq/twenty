import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { msg } from '@lingui/core/macro';

export const VIEW_PICKER_TYPE_SELECT_OPTIONS = [
  {
    value: ViewType.Table,
    label: msg`Table`,
    Icon: viewTypeIconMapping(ViewType.Table),
  },
  {
    value: ViewType.Kanban,
    label: msg`Kanban`,
    Icon: viewTypeIconMapping(ViewType.Kanban),
  },
  {
    value: ViewType.Calendar,
    label: msg`Calendar`,
    Icon: viewTypeIconMapping(ViewType.Calendar),
  },
];
