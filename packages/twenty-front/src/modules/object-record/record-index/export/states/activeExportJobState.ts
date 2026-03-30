import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type ActiveExportJob = {
  exportJobId: string;
  objectNameSingular: string;
  objectNamePlural: string;
} | null;

export const activeExportJobState = createAtomState<ActiveExportJob>({
  key: 'activeExportJobState',
  defaultValue: null,
});
