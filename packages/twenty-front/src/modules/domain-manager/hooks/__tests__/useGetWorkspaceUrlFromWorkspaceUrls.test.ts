import { useGetWorkspaceUrlFromWorkspaceUrls } from '@/domain-manager/hooks/useGetWorkspaceUrlFromWorkspaceUrls';
import { useSearchParams } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
}));

describe('useGetWorkspaceUrlFromWorkspaceUrls', () => {
  const mockUseSearchParams = jest.fn();

  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue([
      {
        get: mockUseSearchParams,
      },
      jest.fn(),
    ]);
  });
  it('should return the subdomainUrl if "force-subdomain-url" is present in searchParams', () => {
    const workspaceUrls = {
      subdomainUrl: 'https://twenty.example.com',
      customUrl: 'https://custom.example.com',
    };
    mockUseSearchParams.mockReturnValue(true);

    const { getWorkspaceUrl } = useGetWorkspaceUrlFromWorkspaceUrls();
    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe(workspaceUrls.subdomainUrl);
  });

  it('should return customUrl if "force-subdomain-url" is not present and customUrl exists', () => {
    const workspaceUrls = {
      subdomainUrl: 'https://twenty.example.com',
      customUrl: 'https://custom.example.com',
    };
    mockUseSearchParams.mockReturnValue(null);

    const { getWorkspaceUrl } = useGetWorkspaceUrlFromWorkspaceUrls();
    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe(workspaceUrls.customUrl);
  });

  it('should return subdomainUrl if "force-subdomain-url" is not present and customUrl is null', () => {
    const workspaceUrls = {
      subdomainUrl: 'https://twenty.example.com',
      customUrl: null,
    };
    mockUseSearchParams.mockReturnValue(null);

    const { getWorkspaceUrl } = useGetWorkspaceUrlFromWorkspaceUrls();
    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe(workspaceUrls.subdomainUrl);
  });
});
