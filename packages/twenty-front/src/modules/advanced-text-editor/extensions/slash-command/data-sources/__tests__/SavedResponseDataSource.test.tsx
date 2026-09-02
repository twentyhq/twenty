import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import {
  SavedResponseDataSourceProvider,
  useSavedResponseDataSource,
} from '@/advanced-text-editor/extensions/slash-command/data-sources/SavedResponseDataSource';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: jest.fn(),
}));

const mockedUseFindManyRecords = jest.mocked(useFindManyRecords);
const mockedUseAtomStateValue = jest.mocked(useAtomStateValue);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SavedResponseDataSourceProvider>{children}</SavedResponseDataSourceProvider>
);

describe('useSavedResponseDataSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request and map saved response fields', () => {
    mockedUseAtomStateValue.mockReturnValue([
      { nameSingular: 'savedResponse' },
    ] as ReturnType<typeof useAtomStateValue>);
    mockedUseFindManyRecords.mockReturnValue({
      records: [
        {
          id: 'response-id',
          name: 'Marketplace Invite',
          subject: 'An invitation',
          body: 'Please join our marketplace.',
          category: 'Marketplace',
        },
      ],
      loading: false,
    } as unknown as ReturnType<typeof useFindManyRecords>);

    const { result } = renderHook(() => useSavedResponseDataSource(), {
      wrapper: Wrapper,
    });

    expect(mockedUseFindManyRecords).toHaveBeenCalledWith({
      objectNameSingular: 'savedResponse',
      recordGqlFields: {
        id: true,
        name: true,
        subject: true,
        body: true,
        category: true,
      },
    });
    expect(result.current.getSavedResponses()).toEqual([
      {
        id: 'response-id',
        name: 'Marketplace Invite',
        subject: 'An invitation',
        body: 'Please join our marketplace.',
        category: 'Marketplace',
      },
    ]);
  });

  it('should return an empty data source when the object is missing', () => {
    mockedUseAtomStateValue.mockReturnValue([
      { nameSingular: 'person' },
    ] as ReturnType<typeof useAtomStateValue>);

    const { result } = renderHook(() => useSavedResponseDataSource(), {
      wrapper: Wrapper,
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.getSavedResponses()).toEqual([]);
    expect(mockedUseFindManyRecords).not.toHaveBeenCalled();
  });
});
