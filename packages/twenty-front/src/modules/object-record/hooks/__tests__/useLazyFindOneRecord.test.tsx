import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useFindOneRecord';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        person: responseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    </SnackBarProviderScope>
  </RecoilRoot>
);

const objectRecordId = '6205681e-7c11-40b4-9e32-f523dbe54590';

describe('useLazyFindOneRecord', () => {
  it('fetches record data when called', async () => {
    const { result } = renderHook(
      () => useLazyFindOneRecord({ objectNameSingular: 'person' }),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.findOneRecord({ objectRecordId: objectRecordId });
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.record).toBeDefined();
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
