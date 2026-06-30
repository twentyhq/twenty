import {
  VIEW_TYPE_LABELS,
  ViewType,
  viewTypeIconMapping,
} from '@/views/types/ViewType';

export const VIEW_PICKER_TYPE_SELECT_OPTIONS = [
  {
    value: ViewType.TABLE,
    label: VIEW_TYPE_LABELS[ViewType.TABLE],
    Icon: viewTypeIconMapping(ViewType.TABLE),
  },
  {
    value: ViewType.KANBAN,
    label: VIEW_TYPE_LABELS[ViewType.KANBAN],
    Icon: viewTypeIconMapping(ViewType.KANBAN),
  },
  {
    value: ViewType.CALENDAR,
    label: VIEW_TYPE_LABELS[ViewType.CALENDAR],
    Icon: viewTypeIconMapping(ViewType.CALENDAR),
  },
];
