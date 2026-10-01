import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { CalendarEventComposerTargetsInput } from '@/activities/calendar/components/CalendarEventComposerTargetsInput';

const mockToggleDropdown = jest.fn();

jest.mock(
  '@/activities/calendar/hooks/useCalendarEventTargetObjectMetadataItems',
  () => ({
    useCalendarEventTargetObjectMetadataItems: () => [
      { id: 'person-object', nameSingular: 'person' },
    ],
  }),
);

jest.mock(
  '@/activities/calendar/hooks/useOpenCalendarEventTargetsPicker',
  () => ({
    useOpenCalendarEventTargetsPicker: () => ({
      openCalendarEventTargetsPicker: jest.fn(),
    }),
  }),
);

jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: ({ record }: { record: { name: string } }) => (
    <span>{record.name}</span>
  ),
}));

jest.mock(
  '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker',
  () => ({ MultipleRecordPicker: () => null }),
);

jest.mock('@/ui/layout/dropdown/components/Dropdown', () => ({
  Dropdown: ({ clickableComponent }: { clickableComponent?: ReactNode }) =>
    clickableComponent ? <div role="button">{clickableComponent}</div> : null,
}));

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: jest.fn() }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useToggleDropdown', () => ({
  useToggleDropdown: () => ({ toggleDropdown: mockToggleDropdown }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => false }),
);

const TARGETS = ['Alpha', 'Beta'].map((name) => ({
  objectMetadataId: 'person-object',
  recordId: name,
  record: { __typename: 'Person', id: name, name },
}));

describe('CalendarEventComposerTargetsInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps overflow separate from the picker and preserves row activation', async () => {
    jest
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(100);
    const user = userEvent.setup();

    render(
      <CalendarEventComposerTargetsInput
        targets={TARGETS}
        onTargetChange={jest.fn()}
      />,
    );

    const overflowButton = screen.getByRole('button', {
      name: 'Show all items',
    });
    const pickerButton = screen.getByRole('button', {
      name: 'Add a related record',
    });

    expect(overflowButton.closest('[role="button"]')).toBeNull();
    expect(pickerButton.closest('[role="button"]')).toBeNull();

    await user.click(overflowButton);

    expect(mockToggleDropdown).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await user.click(screen.getByText('Alpha'));

    expect(mockToggleDropdown).toHaveBeenCalledTimes(1);
  });

  it('opens the picker from the empty placeholder with the keyboard', async () => {
    const user = userEvent.setup();

    render(
      <CalendarEventComposerTargetsInput
        targets={[]}
        onTargetChange={jest.fn()}
      />,
    );

    await user.tab();

    expect(
      screen.getByRole('button', { name: 'Add a related record' }),
    ).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(mockToggleDropdown).toHaveBeenCalledTimes(1);
  });
});
