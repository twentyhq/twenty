import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createState } from 'twenty-ui/utilities';

export const recordPageLayoutsState = createState<PageLayout[]>({
  key: 'recordPageLayoutsState',
  defaultValue: [],
});
