import { type WelcomeTitleFlight } from '@/onboarding/types/WelcomeTitleFlight';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const welcomeTitleFlightState =
  createAtomState<WelcomeTitleFlight | null>({
    key: 'welcomeTitleFlightState',
    defaultValue: null,
  });
