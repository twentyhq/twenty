import { createState } from 'twenty-ui';

import { Telemetry } from '~/generated/graphql';

export const telemetryState = createState<Telemetry>({
  key: 'telemetryState',
  defaultValue: { enabled: true, anonymizationEnabled: true },
});
