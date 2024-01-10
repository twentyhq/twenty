import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useCreateOneRecord';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';

const person = { id: 'a7286b9a-c039-4a89-9567-2dfa7953cda9' };

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        createPerson: { ...person, ...responseData },
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

describe('useCreateOneRecord', () => {
  it('works as expected', async () => {
    const { result } = renderHook(
      () => useCreateOneRecord({ objectNameSingular: 'person' }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.createOneRecord(person);
      expect(res).toBeDefined();
      expect(res).toHaveProperty('id', person.id);
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
