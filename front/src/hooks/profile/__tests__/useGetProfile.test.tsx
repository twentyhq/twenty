import { renderHook } from '@testing-library/react';
import { useQuery, QueryResult } from '@apollo/client';
import { useGetProfile } from '../useGetProfile';

jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
}));

describe('useGetUserEmailFromToken', () => {
  beforeEach(() => {
    const result: Partial<QueryResult<any>> = {
      data: { users: [{ email: 'test@twenty.com' }] },
      loading: false,
      error: undefined,
    };
    (useQuery as jest.Mock).mockImplementation(() => result as QueryResult);
  });

  it('returns profile', () => {
    const { result } = renderHook(() => useGetProfile());
    const email = result.current.user?.email;
    expect(email).toEqual(result.current.user?.email);
    expect(useQuery).toHaveBeenCalledTimes(1);
  });
});
