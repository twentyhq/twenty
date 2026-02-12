import { gql } from '@apollo/client';

import { getTimelineThreadsFromPersonId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromPersonId';

jest.mock('@apollo/client', () => ({
  gql: jest.fn().mockImplementation((strings) => {
    return strings.map((str: string) => str.trim()).join(' ');
  }),
}));

describe('getTimelineThreadsFromPersonId query', () => {
  test('should construct the query correctly', () => {
    expect(gql).toHaveBeenCalled();
    expect(getTimelineThreadsFromPersonId).toBeDefined();
  });
});
