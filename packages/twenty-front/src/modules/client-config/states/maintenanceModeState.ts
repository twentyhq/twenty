import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ClientConfigMaintenanceMode } from '~/generated-metadata/graphql';

type MaintenanceModeState = Pick<
  ClientConfigMaintenanceMode,
  'startAt' | 'endAt' | 'link'
>;

export const maintenanceModeState =
  createAtomState<MaintenanceModeState | null>({
    key: 'maintenanceModeState',
    defaultValue: null,
  });
