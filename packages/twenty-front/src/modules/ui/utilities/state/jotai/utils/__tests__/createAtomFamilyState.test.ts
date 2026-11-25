import { createStore } from 'jotai';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

const createSessionFamilyState = () =>
  createAtomFamilyState<string[], string>({
    key: 'sessionFamily',
    defaultValue: [],
    useSessionStorage: true,
  });

describe('createAtomFamilyState session storage', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('restores a family member saved by an earlier page load', () => {
    createStore().set(createSessionFamilyState().atomFamily('first'), ['jane']);

    const reloadedFamilyState = createSessionFamilyState();

    expect(createStore().get(reloadedFamilyState.atomFamily('first'))).toEqual([
      'jane',
    ]);
    expect(createStore().get(reloadedFamilyState.atomFamily('second'))).toEqual(
      [],
    );
  });
});
