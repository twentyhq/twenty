import { getApplicationContentFilterSearchParams } from '@/settings/applications/utils/getApplicationContentFilterSearchParams';

describe('getApplicationContentFilterSearchParams', () => {
  it('should set the filter value and keep other params', () => {
    const searchParams = new URLSearchParams({ view: 'view-1' });

    const nextSearchParams = getApplicationContentFilterSearchParams({
      searchParams,
      filterKey: 'object',
      universalIdentifier: 'object-1',
    });

    expect(nextSearchParams.toString()).toBe('view=view-1&object=object-1');
    expect(searchParams.toString()).toBe('view=view-1');
  });

  it('should remove the filter when the value is null', () => {
    const nextSearchParams = getApplicationContentFilterSearchParams({
      searchParams: new URLSearchParams({ object: 'object-1', view: 'view-1' }),
      filterKey: 'object',
      universalIdentifier: null,
    });

    expect(nextSearchParams.toString()).toBe('view=view-1');
  });
});
