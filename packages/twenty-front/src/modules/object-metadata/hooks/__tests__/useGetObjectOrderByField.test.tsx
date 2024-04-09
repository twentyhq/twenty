import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useGetObjectOrderByField } from '@/object-metadata/hooks/useGetObjectOrderByField';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

describe('useGetObjectOrderByField', () => {
  it('should work as expected', () => {
    const { result } = renderHook(
      () => {
        const { getObjectOrderByField } = useGetObjectOrderByField({
          objectNameSingular: 'person',
        });

        return getObjectOrderByField('AscNullsLast');
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current).toEqual({
      name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' },
    });
  });
});
