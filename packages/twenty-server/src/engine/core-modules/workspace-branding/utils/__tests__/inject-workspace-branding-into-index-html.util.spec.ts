import { injectWorkspaceBrandingIntoIndexHtml } from '../inject-workspace-branding-into-index-html.util';

const indexHtml = `<!doctype html>
<html>
  <head>
    <!-- BEGIN: Workspace Branding Head -->
    <link rel="icon" href="/favicon.ico" />
    <title>CRM</title>
    <!-- END: Workspace Branding Head -->
  </head>
</html>`;

describe('injectWorkspaceBrandingIntoIndexHtml', () => {
  it('should replace the branding head block with workspace logo and name', () => {
    const result = injectWorkspaceBrandingIntoIndexHtml({
      indexHtml,
      displayName: 'Top of Funnel',
      logoUrl: 'https://crm.example.com/files/workspace-logo.png',
    });

    expect(result).toContain('href="/favicon.ico"');
    expect(result).toContain(
      'content="https://crm.example.com/files/workspace-logo.png"',
    );
    expect(result).toContain('content="Top of Funnel"');
    expect(result).toContain('<title>Top of Funnel</title>');
  });

  it('should escape HTML in display name and logo URL', () => {
    const result = injectWorkspaceBrandingIntoIndexHtml({
      indexHtml,
      displayName: 'Acme "CRM"',
      logoUrl: 'https://example.com/logo.png?a=1&b=2',
    });

    expect(result).toContain('Acme &quot;CRM&quot;');
    expect(result).toContain(
      'https://example.com/logo.png?a=1&amp;b=2',
    );
  });
});
