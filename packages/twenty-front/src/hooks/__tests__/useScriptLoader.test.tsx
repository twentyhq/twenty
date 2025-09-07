import { render } from '@testing-library/react';
import { FC } from 'react';

import { useScriptLoader } from '../useScriptLoader';

describe('useScriptLoader', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('inserts script and triggers onLoad', () => {
    const onLoad = jest.fn();
    const TestComponent: FC = () => {
      useScriptLoader({ src: 'https://example.com/a.js', onLoad });
      return null;
    };

    const { unmount } = render(<TestComponent />);

    const script = document.querySelector(
      'script[src="https://example.com/a.js"]',
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();

    script?.dispatchEvent(new Event('load'));
    expect(onLoad).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('caches script and executes all callbacks', () => {
    const onLoad1 = jest.fn();
    const onLoad2 = jest.fn();

    const Component1: FC = () => {
      useScriptLoader({ src: 'https://example.com/b.js', onLoad: onLoad1 });
      return null;
    };
    const Component2: FC = () => {
      useScriptLoader({ src: 'https://example.com/b.js', onLoad: onLoad2 });
      return null;
    };

    const { rerender, unmount } = render(
      <>
        <Component1 />
        <Component2 />
      </>,
    );

    const scripts = document.querySelectorAll(
      'script[src="https://example.com/b.js"]',
    );
    expect(scripts).toHaveLength(1);

    scripts[0].dispatchEvent(new Event('load'));
    expect(onLoad1).toHaveBeenCalledTimes(1);
    expect(onLoad2).toHaveBeenCalledTimes(1);

    // remove one component, script remains
    rerender(
      <>
        <Component1 />
      </>,
    );
    expect(
      document.querySelectorAll('script[src="https://example.com/b.js"]'),
    ).toHaveLength(1);

    // remove all components, script removed
    rerender(<></>);
    expect(
      document.querySelectorAll('script[src="https://example.com/b.js"]'),
    ).toHaveLength(0);

    unmount();
  });

  it('removes script on unmount', () => {
    const onLoad = jest.fn();
    const TestComponent: FC = () => {
      useScriptLoader({ src: 'https://example.com/c.js', onLoad });
      return null;
    };

    const { unmount } = render(<TestComponent />);
    expect(
      document.querySelectorAll('script[src="https://example.com/c.js"]'),
    ).toHaveLength(1);

    unmount();
    expect(
      document.querySelectorAll('script[src="https://example.com/c.js"]'),
    ).toHaveLength(0);
  });
});

