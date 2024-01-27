import { act, renderHook } from '@testing-library/react';
import { atomFamily, RecoilRoot, useRecoilState } from 'recoil';

import { getScopeInjector } from '../getScopeInjector';

const defaultValue = 'defaultString';

const scopedState = atomFamily<
  string,
  {
    scopeId: string;
  }
>({
  key: 'myStateKey',
  default: defaultValue,
});

describe('getScopeInjector', () => {
  it('should return the scoped state for the given scopeId', () => {
    const scopeInjector = getScopeInjector(scopedState);

    const scopeId = 'scopeId';
    const recoilState = scopeInjector(scopeId);

    const { result } = renderHook(
      () => {
        const [recoil, setRecoil] = useRecoilState(recoilState);
        return { recoil, setRecoil };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    expect(result.current.recoil).toBe(defaultValue);

    const newValue = 'anotherValue';

    act(() => {
      result.current.setRecoil(newValue);
    });

    expect(result.current.recoil).toBe(newValue);
  });
});
