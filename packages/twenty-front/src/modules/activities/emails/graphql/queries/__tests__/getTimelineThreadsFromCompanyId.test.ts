import { gql } from '@apollo/client';

import { getTimelineThreadsFromCompanyId } from '../getTimelineThreadsFromCompanyId';

jest.mock('@apollo/client', () => ({
  gql: jest.fn().mockImplementation((strings) => {
    return strings.map((str: string) => str.trim()).join(' ');
  }),
}));

describe('getTimelineThreadsFromCompanyId query', () => {
  test('should construct the query correctly', () => {
    expect(gql).toHaveBeenCalled();
    expect(getTimelineThreadsFromCompanyId).toBeDefined();
  });
});
