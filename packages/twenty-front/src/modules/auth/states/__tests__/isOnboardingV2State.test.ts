import { createStore } from 'jotai';

import { type isOnboardingV2State as IsOnboardingV2State } from '@/auth/states/isOnboardingV2State';

const loadAtom = (): typeof IsOnboardingV2State => {
  let state: typeof IsOnboardingV2State | undefined;

  jest.isolateModules(() => {
    state = require('@/auth/states/isOnboardingV2State').isOnboardingV2State;
  });

  if (state === undefined) {
    throw new Error('Failed to load isOnboardingV2State');
  }

  return state;
};

describe('isOnboardingV2State', () => {
  afterEach(() => {
    sessionStorage.clear();
    jest.resetModules();
  });

  it('hydrates from sessionStorage on load so the flag survives the email-connect OAuth round-trip', () => {
    sessionStorage.setItem('isOnboardingV2State', JSON.stringify(true));

    const isOnboardingV2State = loadAtom();

    expect(createStore().get(isOnboardingV2State.atom)).toBe(true);
  });

  it('writes through to sessionStorage when set', () => {
    const isOnboardingV2State = loadAtom();
    const store = createStore();

    store.set(isOnboardingV2State.atom, true);

    expect(sessionStorage.getItem('isOnboardingV2State')).toBe(
      JSON.stringify(true),
    );
  });

  it('defaults to false when nothing is persisted', () => {
    const isOnboardingV2State = loadAtom();

    expect(createStore().get(isOnboardingV2State.atom)).toBe(false);
  });
});
