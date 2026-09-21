import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type MouseEvent } from 'react';

import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';

describe('DropdownListItem', () => {
  it('cancels parent navigation before invoking the action with its event', async () => {
    const user = userEvent.setup();
    const onParentClick = jest.fn();
    const onAction = jest.fn((event: MouseEvent<HTMLDivElement>) => {
      expect(event.defaultPrevented).toBe(true);
      expect(event.currentTarget).toHaveTextContent('Archive');
    });

    render(
      <a href="#record" onClick={onParentClick}>
        <DropdownListItem onClick={onAction}>Archive</DropdownListItem>
      </a>,
    );

    await user.click(screen.getByText('Archive'));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('allows a row without an action to activate its containing trigger', async () => {
    const user = userEvent.setup();
    const onTriggerClick = jest.fn();

    render(
      <div onClick={onTriggerClick}>
        <DropdownListItem>Open menu</DropdownListItem>
      </div>,
    );

    await user.click(screen.getByText('Open menu'));

    expect(onTriggerClick).toHaveBeenCalledTimes(1);
  });

  it('keeps disabled actions inactive without stopping propagation', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    const onParentClick = jest.fn();

    render(
      <div onClick={onParentClick}>
        <DropdownListItem disabled onClick={onAction}>
          Delete
        </DropdownListItem>
      </div>,
    );

    await user.click(screen.getByText('Delete'));

    expect(onAction).not.toHaveBeenCalled();
    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  it('gives a text label a tooltip and leaves other content untouched', () => {
    render(
      <>
        <DropdownListItem>Rename</DropdownListItem>
        <DropdownListItem>
          <span data-testid="custom-label">Custom</span>
        </DropdownListItem>
      </>,
    );

    expect(screen.getByText('Rename')).toHaveAttribute(
      'data-testid',
      'tooltip',
    );
    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });
});
