import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type ActiveImportJob = {
  importJobId: string;
  objectNameSingular: string;
  totalRecords: number;
} | null;

export const activeImportJobState = createAtomState<ActiveImportJob>({
  key: 'activeImportJobState',
  defaultValue: null,
});
