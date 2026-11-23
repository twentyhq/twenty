import { SidePanelEditColumnHeader } from '@/side-panel/pages/edit-column/components/SidePanelEditColumnHeader';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useState } from 'react';

const DEFAULT_LABEL = 'Tasks · Filtered';

const EditableHeader = ({
  storedLabel,
  onLabelChange,
}: {
  storedLabel: string | null;
  onLabelChange?: (label: string | null) => void;
}) => {
  const [label, setLabel] = useState(storedLabel);

  return (
    <SidePanelEditColumnHeader
      instanceId="edit-column-label"
      icon={null}
      defaultLabel={DEFAULT_LABEL}
      label={label}
      onLabelChange={(newLabel) => {
        setLabel(newLabel);
        onLabelChange?.(newLabel);
      }}
    />
  );
};

const renderHeader = ({
  storedLabel,
  onLabelChange,
}: {
  storedLabel: string | null;
  onLabelChange?: (label: string | null) => void;
}) =>
  render(
    <JotaiProvider store={createStore()}>
      <EditableHeader storedLabel={storedLabel} onLabelChange={onLabelChange} />
    </JotaiProvider>,
  );

describe('SidePanelEditColumnHeader', () => {
  it('shows the default label of a column without a custom label', () => {
    renderHeader({ storedLabel: null });

    expect(screen.getAllByText(DEFAULT_LABEL)).toHaveLength(1);
  });

  it('shows a custom label next to the default label', () => {
    renderHeader({ storedLabel: 'Open tasks' });

    expect(screen.getByText('Open tasks')).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
  });

  it('renames the column from its title', async () => {
    const user = userEvent.setup();

    renderHeader({ storedLabel: null });

    await user.click(screen.getByText(DEFAULT_LABEL));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Open tasks{Enter}');

    expect(screen.getByText('Open tasks')).toBeInTheDocument();
    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
  });

  it('shows the default label again once the custom label is cleared', async () => {
    const user = userEvent.setup();

    renderHeader({ storedLabel: 'Open tasks' });

    await user.click(screen.getByText('Open tasks'));
    await user.clear(screen.getByRole('textbox'));
    await user.keyboard('{Enter}');

    expect(screen.queryByText('Open tasks')).not.toBeInTheDocument();
    expect(screen.getAllByText(DEFAULT_LABEL)).toHaveLength(1);
  });

  it('hands over the label being typed before the edit ends, for the save shortcut', async () => {
    const user = userEvent.setup();
    const onLabelChange = jest.fn();

    renderHeader({ storedLabel: null, onLabelChange });

    await user.click(screen.getByText(DEFAULT_LABEL));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Open tasks');

    expect(onLabelChange).toHaveBeenLastCalledWith('Open tasks');
  });

  it('puts the previous label back on escape', async () => {
    const user = userEvent.setup();

    renderHeader({ storedLabel: 'Open tasks' });

    await user.click(screen.getByText('Open tasks'));
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Done tasks{Escape}');

    expect(screen.getByText('Open tasks')).toBeInTheDocument();
    expect(screen.queryByText('Done tasks')).not.toBeInTheDocument();
  });
});
