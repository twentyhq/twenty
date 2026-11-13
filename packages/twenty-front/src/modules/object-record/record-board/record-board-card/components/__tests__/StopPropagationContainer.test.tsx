import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createPortal } from 'react-dom';

const renderCard = ({
  shouldLetBackgroundClicksThrough,
}: {
  shouldLetBackgroundClicksThrough: boolean;
}) => {
  const onCardClick = jest.fn();
  const onValueClick = jest.fn();
  const onCopyClick = jest.fn();

  render(
    <div role="button" aria-roledescription="draggable" onClick={onCardClick}>
      <StopPropagationContainer
        shouldLetBackgroundClicksThrough={shouldLetBackgroundClicksThrough}
      >
        <span>Field icon</span>
        <div data-inline-cell-display-mode onClick={onValueClick}>
          <span>Field value</span>
        </div>
        <button onClick={onCopyClick}>Copy</button>
        <a href="#website">Website</a>
        {createPortal(<span>Dropdown option</span>, document.body)}
      </StopPropagationContainer>
    </div>,
  );

  return { onCardClick, onValueClick, onCopyClick };
};

describe('StopPropagationContainer', () => {
  it('should stop every click by default', async () => {
    const user = userEvent.setup();
    const { onCardClick, onValueClick } = renderCard({
      shouldLetBackgroundClicksThrough: false,
    });

    await user.click(screen.getByText('Field icon'));
    await user.click(screen.getByText('Field value'));

    expect(onValueClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('should let a click on the field background reach the card', async () => {
    const user = userEvent.setup();
    const { onCardClick } = renderCard({
      shouldLetBackgroundClicksThrough: true,
    });

    await user.click(screen.getByText('Field icon'));

    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it('should keep a click on the field value away from the card', async () => {
    const user = userEvent.setup();
    const { onCardClick, onValueClick } = renderCard({
      shouldLetBackgroundClicksThrough: true,
    });

    await user.click(screen.getByText('Field value'));

    expect(onValueClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('should keep a click on a button or a link away from the card', async () => {
    const user = userEvent.setup();
    const { onCardClick, onCopyClick } = renderCard({
      shouldLetBackgroundClicksThrough: true,
    });

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await user.click(screen.getByRole('link', { name: 'Website' }));

    expect(onCopyClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('should keep a click portalled out of the field away from the card', async () => {
    const user = userEvent.setup();
    const { onCardClick } = renderCard({
      shouldLetBackgroundClicksThrough: true,
    });

    await user.click(screen.getByText('Dropdown option'));

    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('should keep a click that ends a text selection away from the card', async () => {
    const user = userEvent.setup();
    const { onCardClick } = renderCard({
      shouldLetBackgroundClicksThrough: true,
    });

    jest
      .spyOn(window, 'getSelection')
      .mockReturnValue({ isCollapsed: false } as Selection);

    await user.click(screen.getByText('Field icon'));

    expect(onCardClick).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });
});
