import { PageLayoutTestWrapper } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { fireEvent, render } from '@testing-library/react';

describe('WidgetCardHeader', () => {
  it('lets clicks on the drag grip bubble to the widget card', () => {
    const onClick = jest.fn();

    const { container } = render(
      <PageLayoutTestWrapper>
        <div onClick={onClick}>
          <WidgetCardHeader
            widgetId="widget-under-test"
            variant="flush"
            isInEditMode
            title="Timeline"
          />
        </div>
      </PageLayoutTestWrapper>,
    );

    const grip = container.querySelector('.drag-handle');

    expect(grip).not.toBeNull();
    fireEvent.mouseDown(grip as Element, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(grip as Element, { clientX: 10, clientY: 10 });
    fireEvent.click(grip as Element, { clientX: 10, clientY: 10 });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not let a post-drag click bubble to the widget card', () => {
    const onClick = jest.fn();

    const { container } = render(
      <PageLayoutTestWrapper>
        <div onClick={onClick}>
          <WidgetCardHeader
            widgetId="widget-under-test"
            variant="flush"
            isInEditMode
            title="Timeline"
          />
        </div>
      </PageLayoutTestWrapper>,
    );

    const grip = container.querySelector('.drag-handle');

    expect(grip).not.toBeNull();
    // jsdom has no PointerEvent, so fireEvent.pointerDown drops the
    // coordinates a real browser puts on it.
    fireEvent(
      grip as Element,
      new MouseEvent('pointerdown', {
        bubbles: true,
        clientX: 10,
        clientY: 10,
      }),
    );
    fireEvent.click(grip as Element, { clientX: 30, clientY: 10 });

    expect(onClick).not.toHaveBeenCalled();
  });
});
