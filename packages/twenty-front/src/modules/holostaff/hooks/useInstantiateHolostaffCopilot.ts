import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { holostaffConfigState } from '@/client-config/states/holostaffConfigState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { scheduleIdleCallback } from '~/utils/scheduleIdleCallback';

type BowtieStage = 'onboarding' | 'adoption' | 'expansion';

// Journey stages, by the route the user is on. First match wins. Only
// routes rendered under DefaultLayout are listed, since that is the only
// place this hook mounts: the onboarding and invite steps live under
// BlankLayout, so the copilot never sees them and they are not mapped
// here. Everything else (stall detection, what to say, whether to say
// anything at all) comes from the journey map, not from this file.
const STAGE_ROUTES: [RegExp, BowtieStage][] = [
  [/^\/settings\/(members|billing)/, 'expansion'],
  [/./, 'adoption'],
];

/**
 * Holostaff: an optional in-product success manager for CRM users.
 *
 * Off by default. Nothing loads and nothing is contacted unless both
 * HOLOSTAFF_TENANT_ID and HOLOSTAFF_SOURCE_ID are set on the server
 * (runtime config, so self-hosters can enable it on the prebuilt image
 * without a rebuild). The SDK sits behind a dynamic import inside an
 * idle callback, so with the ids empty no visitor ever downloads its
 * code, and with them set it never competes with app boot.
 *
 * Instantiated from DefaultLayout only, which no public route uses, so
 * it can never run on the auth, invite, or onboarding-activation pages.
 */
export const useInstantiateHolostaffCopilot = () => {
  const [holostaffConfig] = useAtomState(holostaffConfigState);
  const { pathname } = useLocation();
  const sdkRef = useRef<Promise<typeof import('@holostaff/sdk')> | null>(
    null,
  );
  const currentStageRef = useRef<BowtieStage | null>(null);

  const { tenantId, sourceId } = holostaffConfig;

  useEffect(() => {
    if (!tenantId || !sourceId) {
      return;
    }

    // Guards a navigation that happens before the idle callback runs, or
    // before the SDK import settles: an obsolete callback must not report
    // the stage of a route the user has already left.
    let cancelled = false;

    const cancelIdleCallback = scheduleIdleCallback(
      () => {
        if (cancelled) {
          return;
        }

        sdkRef.current =
          sdkRef.current ??
          import('@holostaff/sdk').then((mod) => {
            mod.holostaff.init({
              tenantId,
              sourceId,
              // A CRM screen is full of customer names and emails, so mask
              // the content of every input in the session capture, not
              // just PII field types.
              observe: { maskAllInputs: true },
            });

            return mod;
          });

        const stage = STAGE_ROUTES.find(([pattern]) =>
          pattern.test(pathname),
        )?.[1];

        sdkRef.current
          .then(({ holostaff }) => {
            if (!cancelled && stage && stage !== currentStageRef.current) {
              currentStageRef.current = stage;
              holostaff.markStageEntry(stage);
            }
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.warn('Holostaff did not load:', error);
          });
      },
      { timeout: 2000 },
    );

    return () => {
      cancelled = true;
      cancelIdleCallback();
    };
  }, [tenantId, sourceId, pathname]);
};
