import { Chart } from '@/activities/reports/types/Chart';

export interface Report {
  id: string;
  title: string;
  createdAt: string;
  charts: Chart[]; // TODO
  __typename: string;
}
