import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createState } from '@/ui/utilities/state/utils/createState';

export const recordPageLayoutsState = createState<PageLayout[]>({
  key: 'recordPageLayoutsState',
  defaultValue: [],
});
