import { render, screen } from '@testing-library/react';
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

const renderSelect = (surface?: WorkspaceSurfaceContextValue) => {
  const onChange = jest.fn();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={createStore()}>
      {surface ? (
        <WorkspaceSurfaceContext.Provider value={surface}>
          {children}
        </WorkspaceSurfaceContext.Provider>
      ) : (
        children
      )}
    </JotaiProvider>
  );

  render(
    <Select
      dropdownId="select-dropdown"
      options={[
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ]}
      value="a"
      onChange={onChange}
    />,
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
