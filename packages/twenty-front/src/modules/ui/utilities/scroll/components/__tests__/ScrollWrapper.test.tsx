import { render } from '@testing-library/react';
import React from 'react';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

describe('ScrollWrapper', () => {
  it('renders children with overflow-y enabled class and disabled x-scroll class', () => {
    const { container } = render(
      <ScrollWrapper
        componentInstanceId="test-scroll-wrapper"
        defaultEnableYScroll={true}
        defaultEnableXScroll={false}
      >
        <div style={{ height: '500px' }}>Scrollable content</div>
      </ScrollWrapper>,
    );

    const wrapper = container.querySelector(
      '#scroll-wrapper-test-scroll-wrapper',
    );
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.classList.contains('scroll-wrapper-y-enabled')).toBe(true);
    expect(wrapper?.classList.contains('scroll-wrapper-x-enabled')).toBe(false);
  });

  it('applies both horizontal and vertical scrolling classes when enabled', () => {
    const { container } = render(
      <ScrollWrapper
        componentInstanceId="test-dual-scroll"
        defaultEnableYScroll={true}
        defaultEnableXScroll={true}
      >
        <div>Dual scrollable content</div>
      </ScrollWrapper>,
    );

    const wrapper = container.querySelector('#scroll-wrapper-test-dual-scroll');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.classList.contains('scroll-wrapper-y-enabled')).toBe(true);
    expect(wrapper?.classList.contains('scroll-wrapper-x-enabled')).toBe(true);
  });

  it('renders with autoHeight prop and custom className properly', () => {
    const { container } = render(
      <ScrollWrapper
        componentInstanceId="test-auto-height"
        autoHeight={true}
        className="custom-scroll-class"
      >
        <div>Auto height content</div>
      </ScrollWrapper>,
    );

    const wrapper = container.querySelector('#scroll-wrapper-test-auto-height');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.classList.contains('custom-scroll-class')).toBe(true);
  });
});
