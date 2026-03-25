import { AppPath } from 'twenty-shared/types';
import { buildAppPathWithQueryParams } from '~/utils/buildAppPathWithQueryParams';

describe('buildAppPathWithQueryParams', () => {
  it('should build the correct path with query params', () => {
    expect(
      buildAppPathWithQueryParams(AppPath.PlanRequired, {
        key1: 'value1',
        key2: 'value2',
      }),
    ).toBe('/plan-required?key1=value1&key2=value2');
  });
});
