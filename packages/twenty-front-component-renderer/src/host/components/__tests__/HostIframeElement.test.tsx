import '@/testing/setupServerRenderingGlobals';

import { HostIframeElement } from '@/host/components/HostIframeElement';
import { FrontComponentIframeHostContext } from '@/host/elements/contexts/FrontComponentIframeHostContext';
import { type FrontComponentIframeHostProps } from '@/host/elements/types/FrontComponentIframeHostProps';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const findIframe = (markup: string) =>
  new DOMParser().parseFromString(markup, 'text/html').querySelector('iframe');

describe('HostIframeElement', () => {
  it('denies media and keeps sandbox restrictions without a trusted host', () => {
    const markup = renderToStaticMarkup(
      <HostIframeElement
        src="https://phone.example.com"
        allow="autoplay; microphone *; camera *"
        sandbox="allow-scripts allow-same-origin"
        width="400"
        height="300"
      />,
    );
    const iframe = findIframe(markup);

    expect(iframe?.getAttribute('allow')).toBe(
      "microphone 'none'; camera 'none'; autoplay",
    );
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe?.getAttribute('width')).toBe('400');
    expect(iframe?.getAttribute('height')).toBe('300');
  });

  it('normalizes differently cased sensitive props before invoking the trusted host', () => {
    const TrustedIframeHost = jest.fn(
      (_props: FrontComponentIframeHostProps) => <div>Managed iframe</div>,
    );

    renderToStaticMarkup(
      <FrontComponentIframeHostContext.Provider value={TrustedIframeHost}>
        <HostIframeElement
          SRC="https://phone.example.com"
          SRCDOC="<p>Sandboxed HTML</p>"
          ALLOW="microphone *"
          SANDBOX="allow-scripts allow-same-origin"
          STYLE="width: 400px; height: 300px"
        />
      </FrontComponentIframeHostContext.Provider>,
    );

    expect(TrustedIframeHost.mock.calls[0]?.[0].iframeProps).toEqual(
      expect.objectContaining({
        src: 'https://phone.example.com',
        srcDoc: '<p>Sandboxed HTML</p>',
        allow: 'microphone *',
        sandbox: 'allow-scripts',
      }),
    );
    expect(TrustedIframeHost.mock.calls[0]?.[0].iframeProps).not.toHaveProperty(
      'ALLOW',
    );
    expect(TrustedIframeHost.mock.calls[0]?.[0].iframeProps).not.toHaveProperty(
      'SRCDOC',
    );
  });

  it('keeps ordinary embeds on the native path and explicitly denies media', () => {
    const TrustedIframeHost = jest.fn(
      (_props: FrontComponentIframeHostProps) => <div>Managed iframe</div>,
    );
    const markup = renderToStaticMarkup(
      <FrontComponentIframeHostContext.Provider value={TrustedIframeHost}>
        <HostIframeElement
          src="https://example.com"
          allow="camera 'none'; autoplay"
          data-embed-kind="document"
          className="document-frame"
        />
      </FrontComponentIframeHostContext.Provider>,
    );
    const iframe = findIframe(markup);

    expect(TrustedIframeHost).not.toHaveBeenCalled();
    expect(iframe?.getAttribute('allow')).toBe(
      "microphone 'none'; camera 'none'; autoplay",
    );
    expect(iframe?.getAttribute('data-embed-kind')).toBe('document');
    expect(iframe?.className).toBe('document-frame');
  });

  it('preserves native iframe attributes, styles and handlers while enforcing managed media options', () => {
    const onKeyDown = jest.fn();
    const TrustedIframeHost = jest.fn(
      ({ renderIframe }: FrontComponentIframeHostProps) =>
        renderIframe({
          allow: "microphone 'none'; camera 'none'",
          sandbox: 'allow-scripts',
        }),
    );
    const markup = renderToStaticMarkup(
      <FrontComponentIframeHostContext.Provider value={TrustedIframeHost}>
        <HostIframeElement
          src="https://phone.example.com"
          allow="microphone *"
          sandbox="allow-scripts allow-same-origin"
          className="phone-frame"
          style="width: 376px; height: 666px"
          aria-label="Phone"
          aria-describedby="phone-description"
          data-embed-kind="phone"
          hidden
          onKeyDown={onKeyDown}
        />
      </FrontComponentIframeHostContext.Provider>,
    );
    const iframe = findIframe(markup);

    expect(iframe?.getAttribute('aria-label')).toBe('Phone');
    expect(iframe?.getAttribute('aria-describedby')).toBe('phone-description');
    expect(iframe?.getAttribute('data-embed-kind')).toBe('phone');
    expect(iframe?.className).toBe('phone-frame');
    expect(iframe?.style.width).toBe('376px');
    expect(iframe?.style.height).toBe('666px');
    expect(iframe?.hasAttribute('hidden')).toBe(true);
    expect(iframe?.getAttribute('allow')).toBe(
      "microphone 'none'; camera 'none'",
    );
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts');
    expect(TrustedIframeHost.mock.results[0]?.value).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({ onKeyDown: expect.any(Function) }),
      }),
    );
  });

  it('renders the validated source values used by the managed permission check', () => {
    const TrustedIframeHost = jest.fn(
      ({ renderIframe }: FrontComponentIframeHostProps) =>
        renderIframe({
          allow: 'microphone https://phone.example.com',
          sandbox: 'allow-scripts allow-same-origin',
        }),
    );
    const markup = renderToStaticMarkup(
      <FrontComponentIframeHostContext.Provider value={TrustedIframeHost}>
        <HostIframeElement
          src="https://phone.example.com"
          srcDoc={['<script>parent.document.title = "Injected"</script>']}
          allow="microphone"
        />
      </FrontComponentIframeHostContext.Provider>,
    );
    const iframe = findIframe(markup);

    expect(
      TrustedIframeHost.mock.calls[0]?.[0].iframeProps.srcDoc,
    ).toBeUndefined();
    expect(iframe?.getAttribute('src')).toBe('https://phone.example.com');
    expect(iframe?.hasAttribute('srcdoc')).toBe(false);
  });

  it('gives the trusted host the mounted iframe element', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const TrustedIframeHost = jest.fn(
      ({ renderIframe }: FrontComponentIframeHostProps) =>
        renderIframe({ allow: "microphone 'none'", sandbox: 'allow-scripts' }),
    );

    document.body.append(container);
    act(() => {
      root.render(
        <FrontComponentIframeHostContext.Provider value={TrustedIframeHost}>
          <HostIframeElement
            src="https://phone.example.com"
            allow="microphone"
          />
        </FrontComponentIframeHostContext.Provider>,
      );
    });

    expect(TrustedIframeHost.mock.lastCall?.[0].iframeElement).toBe(
      container.querySelector('iframe'),
    );

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
