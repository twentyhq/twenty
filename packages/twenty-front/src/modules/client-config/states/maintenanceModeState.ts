import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type MaintenanceMode = {
  startAt: string;
  endAt: string;
  link?: string;
};

export const maintenanceModeState = createAtomState<MaintenanceMode | null>({
  key: 'maintenanceModeState',
  defaultValue: null,
});
