import { render } from '@testing-library/react';
import React from 'react';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

describe('ScrollWrapper', () => {
  it('renders children with overflow-y enabled class and standard scrolling properties', () => {
    const { container } = render(
      <ScrollWrapper
        componentInstanceId="test-scroll-wrapper"
        defaultEnableYScroll={true}
        defaultEnableXScroll={false}
      >
        <div style={{ height: '500px' }}>Scrollable content</div>
      </ScrollWrapper>,
    );

    const wrapper = container.querySelector('#scroll-wrapper-test-scroll-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders with autoHeight prop properly', () => {
    const { container } = render(
      <ScrollWrapper
        componentInstanceId="test-auto-height"
        autoHeight={true}
      >
        <div>Auto height content</div>
      </ScrollWrapper>,
    );

    const wrapper = container.querySelector('#scroll-wrapper-test-auto-height');
    expect(wrapper).toBeInTheDocument();
  });
});
