import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import { createFamilyStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilyStateScopeMap';

import { getFamilyScopeInjector } from '../getFamilyScopeInjector';

const defaultValue = 'defaultString';

const testState = createFamilyStateScopeMap<string, string>({
  key: 'familyStateKey',
  defaultValue,
});

describe('getFamilyScopeInjector', () => {
  it('should return a scoped family state', () => {
    const familyScopeInjector = getFamilyScopeInjector(testState);
    const familyState = familyScopeInjector('scopeId', 'familyKey');

    const { result } = renderHook(
      () => {
        const [family, setFamily] = useRecoilState(familyState);
        return { family, setFamily };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    expect(result.current.family).toBe(defaultValue);

    const newValue = 'anotherValue';

    act(() => {
      result.current.setFamily(newValue);
    });

    expect(result.current.family).toBe(newValue);
  });
});
