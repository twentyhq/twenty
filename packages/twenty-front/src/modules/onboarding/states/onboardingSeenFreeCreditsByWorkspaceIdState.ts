import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Persisted so a reward granted before a full page load, like the one the
// email connection earns across its OAuth redirect, still animates in.
export const onboardingSeenFreeCreditsByWorkspaceIdState = createAtomState<
  Record<string, number>
>({
  key: 'onboardingSeenFreeCreditsByWorkspaceIdState',
  defaultValue: {},
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (payload) =>
    Object.values(payload).every((credits) => Number.isFinite(credits)),
});
