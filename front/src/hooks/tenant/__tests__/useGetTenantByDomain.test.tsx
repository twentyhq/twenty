import { renderHook } from '@testing-library/react';
import { useQuery, QueryResult } from '@apollo/client';
import { useGetTenantByDomain } from '../useGetTenantByDomain';

jest.mock('@apollo/client', () => ({
  useQuery: jest.fn(),
}));

describe('useGetTenantByDomain', () => {
  beforeEach(() => {
    const result: Partial<QueryResult<any>> = {
      data: { tenants: [{ domain: 'pilot.twenty.com' }] },
      loading: false,
      error: undefined,
    };
    (useQuery as jest.Mock).mockImplementation(() => result as QueryResult);
  });

  it('returns tenant by domain', () => {
    const { result } = renderHook(() => useGetTenantByDomain());
    const domain = result.current.tenant?.domain;
    expect(domain).toEqual(result.current.tenant?.domain);
    expect(useQuery).toHaveBeenCalledTimes(1);
  });
});
