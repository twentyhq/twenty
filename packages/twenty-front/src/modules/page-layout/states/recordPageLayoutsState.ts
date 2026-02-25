import { type PageLayout } from '@/page-layout/types/PageLayout';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordPageLayoutsState = createAtomState<PageLayout[]>({
  key: 'recordPageLayoutsState',
  defaultValue: [],
});
