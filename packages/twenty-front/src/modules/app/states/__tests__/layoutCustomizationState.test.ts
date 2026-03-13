import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { createStore } from 'jotai';

describe('layout customization state', () => {
  it('should be inactive by default', () => {
    const store = createStore();

    expect(store.get(isLayoutCustomizationActiveState.atom)).toBe(false);
  });

  it('should be settable to true', () => {
    const store = createStore();

    store.set(isLayoutCustomizationActiveState.atom, true);

    expect(store.get(isLayoutCustomizationActiveState.atom)).toBe(true);
  });
});
