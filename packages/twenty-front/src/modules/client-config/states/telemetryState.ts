import { createState } from '@/ui/utilities/state/utils/createState';
import { Telemetry } from '~/generated/graphql';

export const telemetryState = createState<Telemetry>({
  key: 'telemetryState',
  defaultValue: { enabled: true, anonymizationEnabled: true },
});
