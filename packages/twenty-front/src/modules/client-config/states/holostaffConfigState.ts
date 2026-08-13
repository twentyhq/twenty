import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type HolostaffConfig = {
  tenantId: string | null;
  sourceId: string | null;
};

export const holostaffConfigState = createAtomState<HolostaffConfig>({
  key: 'holostaffConfigState',
  defaultValue: {
    tenantId: null,
    sourceId: null,
  },
});
