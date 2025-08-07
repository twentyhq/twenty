import { RecordGqlConnection } from './RecordGqlConnection';

export type RecordGqlNode = {
  id: string;
  __typename: string;
  [key: string]: unknown | RecordGqlNode | RecordGqlConnection;
};
