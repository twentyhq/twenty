import { restrictReadOnlyHostProps } from '../restrictReadOnlyHostProps';

describe('read-only component DOM policy', () => {
  it.each(['file', 'FILE', 'File'])(
    'blocks file controls with type %s',
    (type) => {
      expect(restrictReadOnlyHostProps({ type })).toEqual({});
    },
  );

  it('removes navigation, resource loading, HTML injection and file selection', () => {
    expect(
      restrictReadOnlyHostProps({
        href: 'https://example.com',
        src: 'https://example.com',
        srcDoc: '<script>alert(1)</script>',
        srcSet: 'https://example.com 2x',
        action: '/graphql',
        formAction: '/graphql',
        form: 'host-form',
        dangerouslySetInnerHTML: { __html: '<img src="/private">' },
        type: 'file',
        fill: 'URL(https://example.com)',
        stroke: 'u\\72l(/private)',
        clipPath: 'url(/private)',
        mask: 'url(/private)',
      }),
    ).toEqual({});
  });

  it('keeps local controls and layout without allowing remote CSS or overlays', () => {
    const onClick = jest.fn();
    expect(
      restrictReadOnlyHostProps({
        onClick,
        'aria-label': 'Filter',
        value: 'Acme',
        style: {
          display: 'flex',
          gap: 8,
          backgroundImage: 'url(/private)',
          position: 'fixed',
          zIndex: 9999,
          '--image': 'url(/private)',
          color: 'url(/private)',
          borderColor: 'u\\72l(/private)',
        },
      }),
    ).toEqual({
      onClick,
      'aria-label': 'Filter',
      value: 'Acme',
      style: { display: 'flex', gap: 8 },
    });
  });

  it('preserves ordinary record text containing backslashes or URL syntax', () => {
    const props = {
      value: 'C:\\Users\\Example',
      title: 'url(/example)',
      'aria-label': 'Folder C:\\Users\\Example',
    };

    expect(restrictReadOnlyHostProps(props)).toEqual(props);
  });
});
