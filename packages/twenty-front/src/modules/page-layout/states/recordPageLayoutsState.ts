import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const recordPageLayoutsState = createStateV2<PageLayout[]>({
  key: 'recordPageLayoutsState',
  defaultValue: [],
});
