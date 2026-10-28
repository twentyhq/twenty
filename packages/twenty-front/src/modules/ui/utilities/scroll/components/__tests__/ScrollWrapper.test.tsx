import { render, screen } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

describe('ScrollWrapper', () => {
  it('renders children with scroll-wrapper element and enables y-scroll by default', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ScrollWrapper componentInstanceId="test-scroll">
          <div>Scroll Content</div>
        </ScrollWrapper>
      </Provider>,
    );

    const content = screen.getByText('Scroll Content');
    expect(content).toBeInTheDocument();

    const wrapper = document.getElementById('scroll-wrapper-test-scroll');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.classList.contains('scroll-wrapper-y-enabled')).toBe(true);
  });

  it('honors defaultEnableYScroll and defaultEnableXScroll flags', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <ScrollWrapper
          componentInstanceId="test-no-scroll"
          defaultEnableYScroll={false}
          defaultEnableXScroll={false}
        >
          <div>Disabled Scroll</div>
        </ScrollWrapper>
      </Provider>,
    );

    const wrapper = document.getElementById('scroll-wrapper-test-no-scroll');
    expect(wrapper?.classList.contains('scroll-wrapper-y-enabled')).toBe(false);
    expect(wrapper?.classList.contains('scroll-wrapper-x-enabled')).toBe(false);
  });
});
