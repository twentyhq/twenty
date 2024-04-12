import { gql } from '@apollo/client';
export const ADD_SEGMENT = gql`
mutation CreateOneSegmentList($input: SegmentListCreateInput!) {
  createSegmentList(data: $input) {
    id
  }
}`;