import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useDeleteOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';

const personId = 'a7286b9a-c039-4a89-9567-2dfa7953cda9';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        deletePerson: responseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

describe('useDeleteOneRecord', () => {
  it('works as expected', async () => {
    const { result } = renderHook(
      () => useDeleteOneRecord({ objectNameSingular: 'person' }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.deleteOneRecord(personId);
      expect(res).toBeDefined();
      expect(res).toHaveProperty('id', personId);
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
