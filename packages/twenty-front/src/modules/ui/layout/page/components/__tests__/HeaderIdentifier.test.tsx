import { TitleInput } from '@/ui/input/components/TitleInput';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

describe.each(['md', 'lg'] as const)(
  'HeaderIdentifier (%s titles)',
  (fontSize) => {
    it('renders a record title and preserves avatar interactions', async () => {
      const user = userEvent.setup();
      const onAvatarClick = jest.fn();

      render(
        <HeaderIdentifier
          fontSize={fontSize}
          avatar={{ placeholder: 'Acme', onClick: onAvatarClick }}
          title="Acme"
          label="Created 2 days ago"
        />,
      );

      expect(
        screen.getByRole('heading', { level: 3, name: 'Acme' }),
      ).toBeVisible();
      expect(screen.getByText('Created 2 days ago')).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Acme' }));

      expect(onAvatarClick).toHaveBeenCalledTimes(1);
    });

    it('preserves an interactive icon alongside the chart title and label', async () => {
      const user = userEvent.setup();
      const onIconClick = jest.fn();

      render(
        <HeaderIdentifier
          fontSize={fontSize}
          icon={
            <button aria-label="Change chart icon" onClick={onIconClick}>
              Icon
            </button>
          }
          title="Revenue forecast"
          label="Chart"
        />,
      );

      expect(
        screen.getByRole('heading', { level: 3, name: 'Revenue forecast' }),
      ).toBeVisible();
      expect(screen.getByText('Chart')).toBeVisible();

      await user.click(
        screen.getByRole('button', { name: 'Change chart icon' }),
      );

      expect(onIconClick).toHaveBeenCalledTimes(1);
    });

    it('preserves title editing and delegates saving to the caller', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const onEnter = jest.fn();

      render(
        <JotaiProvider store={createStore()}>
          <HeaderIdentifier
            fontSize={fontSize}
            title={
              <TitleInput
                instanceId="header-identifier-title"
                sizeVariant="sm"
                value="Revenue forecast"
                onChange={onChange}
                onEnter={onEnter}
              />
            }
            label="Chart"
          />
        </JotaiProvider>,
      );

      await user.click(screen.getByText('Revenue forecast'));

      const titleInput = screen.getByRole('textbox');

      await user.clear(titleInput);
      await user.type(titleInput, 'Updated forecast{Enter}');

      expect(onChange).toHaveBeenLastCalledWith('Updated forecast');
      expect(onEnter).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('supports a linked title without an icon or label', () => {
      render(
        <HeaderIdentifier
          fontSize={fontSize}
          title={<a href="/record/acme">Acme</a>}
        />,
      );

      expect(
        screen.getByRole('heading', { level: 3, name: 'Acme' }),
      ).toBeVisible();
      expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute(
        'href',
        '/record/acme',
      );
    });
  },
);
