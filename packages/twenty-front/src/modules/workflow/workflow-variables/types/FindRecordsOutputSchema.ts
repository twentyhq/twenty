import { type RecordOutputSchemaV2 } from './RecordOutputSchemaV2';

type RecordNode = {
  isLeaf: false;
  label: string;
  value: RecordOutputSchemaV2;
};

export type FindRecordsOutputSchema = {
  first: RecordNode;
  last: RecordNode;
  totalCount: number;
};
