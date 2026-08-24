import { SettingsApplicationTimelineActivityTypesListCard } from '~/pages/settings/applications/components/SettingsApplicationTimelineActivityTypesListCard';
import { fireEvent, render, screen } from '@testing-library/react';

const onReset = jest.fn();
const onToggle = jest.fn();

jest.mock('@/settings/components/SettingsListCard', () => ({
  SettingsListCard: ({
    items,
    RowRightComponent,
  }: {
    items: Array<{ id: string; label: string }>;
    RowRightComponent: React.ComponentType<{
      item: { id: string; label: string; isActive: boolean };
    }>;
  }) => (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {item.label}
          <RowRightComponent
            item={{ ...item, isActive: item.id === 'active-type' }}
          />
        </div>
      ))}
    </div>
  ),
}));

jest.mock('twenty-ui/icon', () => ({
  useIcons: () => ({ getIcon: jest.fn() }),
}));

jest.mock('twenty-ui/input', () => ({
  Toggle: ({
    'aria-label': ariaLabel,
    disabled,
    onChange,
    value,
  }: {
    'aria-label': string;
    disabled: boolean;
    onChange: (value: boolean) => void;
    value: boolean;
  }) => (
    <button
      aria-label={ariaLabel}
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      role="switch"
    />
  ),
}));

jest.mock(
  '~/pages/settings/applications/components/SettingsApplicationTimelineActivityTypeRowDropdown',
  () => ({
    SettingsApplicationTimelineActivityTypeRowDropdown: ({
      onReset: reset,
    }: {
      onReset: () => void;
    }) => <button onClick={reset}>Reset to default</button>,
  }),
);

const timelineActivityTypes = [
  {
    action: 'linked',
    icon: 'IconPaperclip',
    id: 'active-type',
    isActive: true,
    isInstalled: true,
    label: 'Attached a file',
    name: 'attachmentLinked',
  },
  {
    action: 'unlinked',
    icon: 'IconUnlink',
    id: 'inactive-type',
    isActive: false,
    isInstalled: true,
    label: 'Removed an attachment',
    name: 'attachmentUnlinked',
  },
];

describe('SettingsApplicationTimelineActivityTypesListCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses standard switches for activation', () => {
    render(
      <SettingsApplicationTimelineActivityTypesListCard
        canReset
        isLoading={false}
        mutatingTimelineActivityTypeIds={new Set()}
        timelineActivityTypes={timelineActivityTypes}
        onReset={onReset}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(
      screen.getByRole('switch', { name: 'Active Attached a file' }),
    );

    expect(onToggle).toHaveBeenCalledWith('active-type', false);
  });

  it('moves reset into the standard row overflow action', () => {
    render(
      <SettingsApplicationTimelineActivityTypesListCard
        canReset
        isLoading={false}
        mutatingTimelineActivityTypeIds={new Set()}
        timelineActivityTypes={timelineActivityTypes}
        onReset={onReset}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(screen.getAllByText('Reset to default')[1]);

    expect(onReset).toHaveBeenCalledWith('inactive-type');
  });
});
