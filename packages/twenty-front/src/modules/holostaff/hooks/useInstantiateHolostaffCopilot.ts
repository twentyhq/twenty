import { type BowtieStage, type HolostaffApi } from '@holostaff/sdk';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { holostaffConfigState } from '@/client-config/states/holostaffConfigState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { scheduleIdleCallback } from '~/utils/scheduleIdleCallback';

// Journey stages, by the route the user is on. First match wins. Covers
// the routes the copilot actually mounts on: the authenticated app shell
// (DefaultLayout) and the signed-in onboarding steps (OnboardingStepLayout).
// Everything else (stall detection, what to say, whether to say anything
// at all) comes from the journey map, not from this file.
const STAGE_ROUTES: [RegExp, BowtieStage][] = [
  [
    /^\/(create\/profile|sync\/emails|install-apps|invite-team|book-call)/,
    'onboarding',
  ],
  [/^\/(plan-required|settings\/(members|billing))/, 'expansion'],
  [/./, 'adoption'],
];

// The SDK is a browser-global singleton, so its handle and the last
// reported stage live at module scope rather than in component state.
let holostaffApiPromise: Promise<HolostaffApi> | null = null;
let currentStage: BowtieStage | null = null;

const loadHolostaff = (
  tenantId: string,
  sourceId: string,
): Promise<HolostaffApi> => {
  holostaffApiPromise =
    holostaffApiPromise ??
    import('@holostaff/sdk').then(({ holostaff }) => {
      holostaff.init({
        tenantId,
        sourceId,
        // A CRM screen is full of customer names and emails, so mask the
        // content of every input in the session capture, not just PII
        // field types.
        observe: { maskAllInputs: true },
      });

      return holostaff;
    });

  return holostaffApiPromise;
};

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
 * Instantiated from the authenticated app shell (DefaultLayout) and the
 * signed-in onboarding steps (OnboardingStepLayout). Both are behind
 * authentication, so the copilot never runs on the anonymous sign-in,
 * invite-acceptance, email-verification, or OAuth-consent pages.
 */
export const useInstantiateHolostaffCopilot = () => {
  const [holostaffConfig] = useAtomState(holostaffConfigState);
  const { pathname } = useLocation();

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

        const stage = STAGE_ROUTES.find(([pattern]) =>
          pattern.test(pathname),
        )?.[1];

        loadHolostaff(tenantId, sourceId)
          .then((holostaff) => {
            if (!cancelled && stage && stage !== currentStage) {
              currentStage = stage;
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
