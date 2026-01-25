import { gql } from '@apollo/client';
import { vi } from 'vitest';

import { getTimelineThreadsFromCompanyId } from '@/activities/emails/graphql/queries/getTimelineThreadsFromCompanyId';

vi.mock('@apollo/client', () => ({
  gql: vi.fn().mockImplementation((strings) => {
    return strings.map((str: string) => str.trim()).join(' ');
  }),
}));

describe('getTimelineThreadsFromCompanyId query', () => {
  test('should construct the query correctly', () => {
    expect(gql).toHaveBeenCalled();
    expect(getTimelineThreadsFromCompanyId).toBeDefined();
  });
});
