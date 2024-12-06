import { gql } from '@apollo/client';

export const AGGREGATE_QUERY = gql`
  query AggregateOpportunities($filter: OpportunityFilterInput) {
    opportunities(filter: $filter) {
      totalCount
      sumAmount
      avgAmount
    }
  }
`;

export const mockResponse = {
  opportunities: {
    totalCount: 42,
    sumAmount: 1000000,
    avgAmount: 23800
  }
};