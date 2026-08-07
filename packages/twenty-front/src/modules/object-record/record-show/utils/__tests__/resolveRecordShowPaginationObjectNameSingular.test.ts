import { resolveRecordShowPaginationObjectNameSingular } from '@/object-record/record-show/utils/resolveRecordShowPaginationObjectNameSingular';
import { CoreObjectNameSingular } from 'twenty-shared/types';

describe('resolveRecordShowPaginationObjectNameSingular', () => {
  it('uses the parent view object when opening from a dashboard widget', () => {
    expect(
      resolveRecordShowPaginationObjectNameSingular({
        propsOrParamObjectNameSingular: CoreObjectNameSingular.Dashboard,
        parentViewObjectNameSingular: 'equipment',
      }),
    ).toBe('equipment');
  });

  it('falls back to the provided object when no parent view context exists', () => {
    expect(
      resolveRecordShowPaginationObjectNameSingular({
        propsOrParamObjectNameSingular: 'equipment',
        parentViewObjectNameSingular: undefined,
      }),
    ).toBe('equipment');
  });

  it('ignores stale parent view context when opening a different object record page', () => {
    expect(
      resolveRecordShowPaginationObjectNameSingular({
        propsOrParamObjectNameSingular: CoreObjectNameSingular.Person,
        parentViewObjectNameSingular: 'equipment',
      }),
    ).toBe(CoreObjectNameSingular.Person);
  });
});
