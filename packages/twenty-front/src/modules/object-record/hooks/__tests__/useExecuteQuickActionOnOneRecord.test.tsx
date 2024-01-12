import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useExecuteQuickActionOnOneRecord';
import { useExecuteQuickActionOnOneRecord } from '@/object-record/hooks/useExecuteQuickActionOnOneRecord';

const idToExecuteQuickActionOn = 'a7286b9a-c039-4a89-9567-2dfa7953cda9';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        executeQuickActionOnPerson: {
          ...responseData,
          id: idToExecuteQuickActionOn,
        },
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

describe('useExecuteQuickActionOnOneRecord', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () =>
        useExecuteQuickActionOnOneRecord({
          objectNameSingular: 'person',
        }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.executeQuickActionOnOneRecord(
        idToExecuteQuickActionOn,
      );

      expect(res).toHaveProperty('id', idToExecuteQuickActionOn);
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
