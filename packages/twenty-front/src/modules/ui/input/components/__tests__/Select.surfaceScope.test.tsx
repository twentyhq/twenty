import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { Select } from '@/ui/input/components/Select';
import {
  WorkspaceSurfaceContext,
  type WorkspaceSurfaceContextValue,
} from '@/ui/layout/contexts/WorkspaceSurfaceContext';

const SIDE_PANEL_SURFACE: WorkspaceSurfaceContextValue = {
  type: 'side-panel',
  instanceId: 'side-panel-page',
  ownsRouteLocation: true,
};

const renderSelect = (
  surface?: WorkspaceSurfaceContextValue,
  disabled = false,
  withSearchInput = false,
) => {
  const onChange = jest.fn();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={createStore()}>
        {surface ? (
          <WorkspaceSurfaceContext.Provider value={surface}>
            {children}
          </WorkspaceSurfaceContext.Provider>
        ) : (
          children
        )}
      </JotaiProvider>
    </I18nProvider>
  );

  render(
    <>
      <Select
        disabled={disabled}
        withSearchInput={withSearchInput}
        dropdownId="select-dropdown"
        options={[
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ]}
        value="a"
        onChange={onChange}
      />
      <input aria-label="Next field" />
    </>,
    { wrapper: Wrapper },
  );

  return { onChange };
};

describe('Select on a side panel surface', () => {
  it.each([
    ['main', undefined],
    ['side-panel', SIDE_PANEL_SURFACE],
  ])('selects an option with the keyboard on %s', async (_, surface) => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(surface);

    await user.click(screen.getByText('Option A'));
    expect(await screen.findByText('Option B')).toBeInTheDocument();

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('b');
  });

  it.each([
    ['main', undefined],
    ['side-panel', SIDE_PANEL_SURFACE],
  ])('selects an option with a click on %s', async (_, surface) => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(surface);

    await user.click(screen.getByText('Option A'));
    await user.click(await screen.findByText('Option B'));

    expect(onChange).toHaveBeenCalledWith('b');
  });
});

it.each(['{Enter}', ' '])(
  'opens a select reached with Tab using %s, selects and continues',
  async (key) => {
    const user = userEvent.setup();
    const { onChange } = renderSelect(SIDE_PANEL_SURFACE);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Option A' })).toHaveFocus();
    await user.keyboard(key);
    expect(await screen.findByText('Option B')).toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith('b');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Option A' })).toHaveFocus(),
    );
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Next field' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Option A' })).toHaveFocus();
  },
);

it('skips disabled selects when tabbing', async () => {
  const user = userEvent.setup();
  renderSelect(SIDE_PANEL_SURFACE, true);
  await user.tab();
  expect(screen.getByRole('textbox', { name: 'Next field' })).toHaveFocus();
});

it('continues to the next form field from an open searchable select', async () => {
  const user = userEvent.setup();
  renderSelect(SIDE_PANEL_SURFACE, false, true);
  await user.tab();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Option B')).toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole('textbox', { name: 'Next field' })).toHaveFocus();
  expect(screen.queryByText('Option B')).not.toBeInTheDocument();
});

it('returns focus after selecting from a searchable select', async () => {
  const user = userEvent.setup();
  const { onChange } = renderSelect(SIDE_PANEL_SURFACE, false, true);
  await user.tab();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Option B')).toBeInTheDocument();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(onChange).toHaveBeenCalledWith('b');
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Option A' })).toHaveFocus(),
  );
  await user.tab();
  expect(screen.getByRole('textbox', { name: 'Next field' })).toHaveFocus();
});

it('returns to the trigger with Shift+Tab from an open searchable select', async () => {
  const user = userEvent.setup();
  renderSelect(SIDE_PANEL_SURFACE, false, true);
  await user.tab();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Option B')).toBeInTheDocument();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: 'Option A' })).toHaveFocus();
});

it('restores focus after Escape without reopening the menu', async () => {
  const user = userEvent.setup();
  renderSelect(SIDE_PANEL_SURFACE, false, true);
  await user.tab();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Option B')).toBeInTheDocument();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: 'Option A' })).toHaveFocus();
  expect(screen.queryByText('Option B')).not.toBeInTheDocument();
  await user.tab();
  expect(screen.getByRole('textbox', { name: 'Next field' })).toHaveFocus();
});

it('keeps Space on the focused trigger of an open select from scrolling the page', async () => {
  const user = userEvent.setup();
  renderSelect(SIDE_PANEL_SURFACE);
  await user.tab();
  await user.keyboard('{Enter}');
  expect(await screen.findByText('Option B')).toBeInTheDocument();
  const trigger = screen.getByRole('button', { name: 'Option A' });
  expect(trigger).toHaveFocus();

  expect(fireEvent.keyDown(trigger, { key: ' ' })).toBe(false);
  expect(screen.getByText('Option B')).toBeInTheDocument();
});
