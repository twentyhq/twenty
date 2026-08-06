import {
  ViewType,
  viewTypeIconKeyMapping,
  viewTypeIconMapping,
} from '@/views/types/ViewType';

import {
  IconCalendar,
  IconLayoutKanban,
  IconListDetails,
  IconTable,
} from 'twenty-ui/icon';

describe('view type icon mapping', () => {
  it.each([
    [ViewType.TABLE, IconTable, 'IconTable'],
    [ViewType.KANBAN, IconLayoutKanban, 'IconLayoutKanban'],
    [ViewType.CALENDAR, IconCalendar, 'IconCalendar'],
    [ViewType.FIELDS_WIDGET, IconListDetails, 'IconListDetails'],
    [ViewType.TABLE_WIDGET, IconTable, 'IconTable'],
    [ViewType.KANBAN_WIDGET, IconLayoutKanban, 'IconLayoutKanban'],
    [ViewType.CALENDAR_WIDGET, IconCalendar, 'IconCalendar'],
  ])(
    'maps %s to its canonical icon component and key',
    (viewType, expectedIcon, expectedIconKey) => {
      expect(viewTypeIconMapping(viewType)).toBe(expectedIcon);
      expect(viewTypeIconKeyMapping(viewType)).toBe(expectedIconKey);
    },
  );

  it('falls back to the table icon', () => {
    expect(viewTypeIconMapping()).toBe(IconTable);
    expect(viewTypeIconKeyMapping()).toBe('IconTable');
  });
});
