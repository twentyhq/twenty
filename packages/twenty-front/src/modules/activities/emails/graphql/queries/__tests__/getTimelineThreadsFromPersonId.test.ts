import { gql } from '@apollo/client';
import { vi } from 'vitest';

import { getTimelineThreadsFromPersonId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromPersonId';

vi.mock('@apollo/client', () => ({
  gql: vi.fn().mockImplementation((strings) => {
    return strings.map((str: string) => str.trim()).join(' ');
  }),
}));

describe('getTimelineThreadsFromPersonId query', () => {
  test('should construct the query correctly', () => {
    expect(gql).toHaveBeenCalled();
    expect(getTimelineThreadsFromPersonId).toBeDefined();
  });
});
