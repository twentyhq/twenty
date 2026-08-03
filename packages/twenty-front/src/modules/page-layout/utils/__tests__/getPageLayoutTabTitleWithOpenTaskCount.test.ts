import { getPageLayoutTabTitleWithOpenTaskCount } from '@/page-layout/utils/getPageLayoutTabTitleWithOpenTaskCount';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { WidgetType } from '~/generated-metadata/graphql';

const buildTab = ({
  title,
  widgetTypes,
}: {
  title: string;
  widgetTypes: WidgetType[];
}) =>
  ({
    title,
    widgets: widgetTypes.map((type) => ({ type })),
  }) as PageLayoutTab;

const tasksTab = buildTab({ title: 'Tasks', widgetTypes: [WidgetType.TASKS] });
const notesTab = buildTab({ title: 'Notes', widgetTypes: [WidgetType.NOTES] });

describe('getPageLayoutTabTitleWithOpenTaskCount', () => {
  it('should append the count when the tasks tab has open tasks', () => {
    expect(
      getPageLayoutTabTitleWithOpenTaskCount({
        tab: tasksTab,
        openTaskCount: 3,
      }),
    ).toBe('Tasks (3)');
  });

  it('should leave the title alone when there are no open tasks', () => {
    expect(
      getPageLayoutTabTitleWithOpenTaskCount({
        tab: tasksTab,
        openTaskCount: 0,
      }),
    ).toBe('Tasks');
  });

  it('should leave the title alone when the count is unknown', () => {
    expect(
      getPageLayoutTabTitleWithOpenTaskCount({
        tab: tasksTab,
        openTaskCount: undefined,
      }),
    ).toBe('Tasks');
  });

  it('should not append the count to tabs without a tasks widget', () => {
    expect(
      getPageLayoutTabTitleWithOpenTaskCount({
        tab: notesTab,
        openTaskCount: 3,
      }),
    ).toBe('Notes');
  });

  it('should match on the widget rather than the title so renamed tabs keep their count', () => {
    expect(
      getPageLayoutTabTitleWithOpenTaskCount({
        tab: buildTab({ title: 'Follow-ups', widgetTypes: [WidgetType.TASKS] }),
        openTaskCount: 2,
      }),
    ).toBe('Follow-ups (2)');
  });
});
