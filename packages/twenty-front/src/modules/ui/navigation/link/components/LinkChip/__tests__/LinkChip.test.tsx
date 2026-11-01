import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { IconUser } from 'twenty-ui/icon';

import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';

const LocationProbe = () => {
  const { pathname } = useLocation();

  return <div role="status">{pathname}</div>;
};

describe('LinkChip', () => {
  it('forwards native attributes and the actual anchor ref without nesting links', () => {
    const ref = createRef<HTMLAnchorElement>();

    render(
      <MemoryRouter>
        <LinkChip
          to="/records/1"
          target="_blank"
          aria-label="Open record"
          ref={ref}
        >
          https://twenty.com
        </LinkChip>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Open record' });

    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute('href', '/records/1');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('a')).toBeNull();
  });

  it('navigates on Enter with the default mouse-down trigger', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/records']}>
        <LinkChip to="/records/1">Open record</LinkChip>
        <LocationProbe />
      </MemoryRouter>,
    );

    await user.tab();
    expect(screen.getByRole('link', { name: 'Open record' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('status')).toHaveTextContent('/records/1');
  });

  it('activates an explicitly named icon-only link once per pointer or keyboard action', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const onParentClick = jest.fn();

    render(
      <MemoryRouter>
        <div onClick={onParentClick}>
          <LinkChip
            to="/records/1"
            aria-label="Open record"
            startElement={<IconUser aria-hidden />}
            onClick={onClick}
          />
        </div>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Open record' });

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
