import { ViewType, viewTypeIconKeyMapping } from '@/views/types/ViewType';

describe('viewTypeIconKeyMapping', () => {
  it.each([
    [ViewType.TABLE, 'IconTable'],
    [ViewType.KANBAN, 'IconLayoutKanban'],
    [ViewType.CALENDAR, 'IconCalendar'],
  ])('maps %s to its canonical icon key', (viewType, expectedIconKey) => {
    expect(viewTypeIconKeyMapping(viewType)).toBe(expectedIconKey);
  });

  it('falls back to the table icon', () => {
    expect(viewTypeIconKeyMapping()).toBe('IconTable');
  });
});
