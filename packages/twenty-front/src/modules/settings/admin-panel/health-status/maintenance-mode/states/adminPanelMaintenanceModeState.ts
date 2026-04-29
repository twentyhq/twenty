import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

type AdminPanelMaintenanceMode = {
  startAt: string;
  endAt: string;
  link?: string | null;
};

export const adminPanelMaintenanceModeState =
  createAtomState<AdminPanelMaintenanceMode | null>({
    key: 'adminPanelMaintenanceModeState',
    defaultValue: null,
  });
