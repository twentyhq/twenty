import { renderHook } from '@testing-library/react';

import { useSavedResponseDataSource } from '@/advanced-text-editor/extensions/slash-command/data-sources/SavedResponseDataSource';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

const mockedUseFindManyRecords = jest.mocked(useFindManyRecords);

describe('useSavedResponseDataSource', () => {
  it('should request and map saved response fields', () => {
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

    const { result } = renderHook(() => useSavedResponseDataSource());

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
});
