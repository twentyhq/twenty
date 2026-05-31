import { generateWorkspaceManifest } from '../generate-workspace-manifest.util';

describe('generateWorkspaceManifest', () => {
  it('returns branded manifest when displayName and logoUrl are provided', () => {
    const result = generateWorkspaceManifest({
      displayName: 'Acme Corp',
      logoUrl: 'https://files.example.com/logo.png',
    });

    expect(result.name).toBe('Acme Corp');
    expect(result.short_name).toBe('Acme Corp');
    expect(result.icons).toHaveLength(2);
    expect(result.icons[0]).toEqual({
      src: 'https://files.example.com/logo.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    });
  });

  it('returns neutral fallback manifest when no branding is provided', () => {
    const result = generateWorkspaceManifest({
      displayName: null,
      logoUrl: null,
    });

    expect(result.name).toBe('CRM');
    expect(result.icons).toHaveLength(1);
    expect(result.icons[0].src).toBe('/branding/default-app-icon.svg');
    expect(result.icons[0].type).toBe('image/svg+xml');
  });

  it('falls back to CRM when displayName is empty string', () => {
    const result = generateWorkspaceManifest({
      displayName: '',
      logoUrl: 'https://example.com/logo.png',
    });

    expect(result.name).toBe('CRM');
  });

  it('uses svg mime type and sizes when logoUrl is an svg', () => {
    const result = generateWorkspaceManifest({
      displayName: 'Acme Corp',
      logoUrl: 'https://files.example.com/logo.svg',
    });

    expect(result.icons).toHaveLength(2);
    expect(result.icons[0]).toEqual({
      src: 'https://files.example.com/logo.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    });
    expect(result.icons[1].type).toBe('image/svg+xml');
    expect(result.icons[1].sizes).toBe('any');
  });

  it('uses ico mime type when logoUrl is an ico', () => {
    const result = generateWorkspaceManifest({
      displayName: 'Acme Corp',
      logoUrl: 'https://files.example.com/logo.ico',
    });

    expect(result.icons[0].type).toBe('image/x-icon');
    expect(result.icons[0].sizes).toBe('192x192');
  });
});
