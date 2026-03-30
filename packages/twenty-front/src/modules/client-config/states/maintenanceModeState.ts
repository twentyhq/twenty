import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ClientConfigMaintenanceMode } from '~/generated-metadata/graphql';

export const maintenanceModeState =
  createAtomState<ClientConfigMaintenanceMode | null>({
    key: 'maintenanceModeState',
    defaultValue: null,
  });
