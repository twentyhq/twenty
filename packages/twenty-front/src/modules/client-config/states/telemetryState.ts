import { atom } from 'recoil';

import { Telemetry } from '~/generated/graphql';

export const telemetryState = atom<Telemetry>({
  key: 'telemetryState',
  default: { enabled: true, anonymizationEnabled: true },
});
