import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useCreateManyRecords';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';

const people = [
  { id: 'a7286b9a-c039-4a89-9567-2dfa7953cda9' },
  { id: '37faabcd-cb39-4a0a-8618-7e3fda9afca0' },
];

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        createPeople: people.map((person) => ({
          id: person.id,
          ...responseData,
        })),
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

describe('useCreateManyRecords', () => {
  it('works as expected', async () => {
    const { result } = renderHook(
      () => useCreateManyRecords({ objectNameSingular: 'person' }),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.createManyRecords(people);
      expect(res).toBeDefined();
      expect(Array.isArray(res)).toBe(true);
      expect(res?.length).toBe(2);
      expect(res?.[0].id).toBe(people[0].id);
      expect(res?.[1].id).toBe(people[1].id);
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
