import { type WorkspaceUrls } from '~/generated/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

describe('getWorkspaceUrl', () => {
  it('should return customUrl when it is defined', () => {
    const workspaceUrls: WorkspaceUrls = {
      customUrl: 'https://custom.example.com',
      subdomainUrl: 'https://subdomain.twenty.com',
    };

    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe('https://custom.example.com');
  });

  it('should return subdomainUrl when customUrl is null', () => {
    const workspaceUrls: WorkspaceUrls = {
      customUrl: null,
      subdomainUrl: 'https://subdomain.twenty.com',
    };

    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe('https://subdomain.twenty.com');
  });

  it('should return subdomainUrl when customUrl is undefined', () => {
    const workspaceUrls: WorkspaceUrls = {
      customUrl: undefined,
      subdomainUrl: 'https://subdomain.twenty.com',
    };

    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe('https://subdomain.twenty.com');
  });

  it('should return customUrl when both customUrl and subdomainUrl are defined', () => {
    const workspaceUrls: WorkspaceUrls = {
      customUrl: 'https://my-company.com',
      subdomainUrl: 'https://mycompany.twenty.com',
    };

    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe('https://my-company.com');
  });

  it('should return empty string when customUrl is empty string', () => {
    const workspaceUrls: WorkspaceUrls = {
      customUrl: '',
      subdomainUrl: 'https://subdomain.twenty.com',
    };

    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe('');
  });

  it('should return subdomainUrl when customUrl is explicitly undefined', () => {
    const workspaceUrls: WorkspaceUrls = {
      customUrl: undefined,
      subdomainUrl: 'https://subdomain.twenty.com',
    };

    const result = getWorkspaceUrl(workspaceUrls);

    expect(result).toBe('https://subdomain.twenty.com');
  });
});
