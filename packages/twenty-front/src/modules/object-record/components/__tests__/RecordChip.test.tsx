import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RecordChip } from '@/object-record/components/RecordChip';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';

const mockOpenRecordInCommandMenu = jest.fn();
const mockUseAtomStateValue = jest.fn();
const mockLinkChip = jest.fn();

jest.mock('@/command-menu/hooks/useOpenRecordInCommandMenu', () => ({
  useOpenRecordInCommandMenu: () => ({
    openRecordInCommandMenu: mockOpenRecordInCommandMenu,
  }),
}));

jest.mock('@/object-record/hooks/useRecordChipData', () => ({
  useRecordChipData: () => ({
    recordChipData: {
      avatarType: 'rounded',
      avatarUrl: '',
      name: 'Acme Corp',
    },
  }),
}));

jest.mock('@/object-record/utils/canOpenObjectInSidePanel', () => ({
  canOpenObjectInSidePanel: jest.fn(() => true),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => mockUseAtomStateValue(),
}));

jest.mock('twenty-ui/components', () => ({
  AvatarChip: () => null,
  Chip: ({ label }: { label: string }) => <div>{label}</div>,
  ChipVariant: {
    Highlighted: 'highlighted',
    Transparent: 'transparent',
  },
  LinkChip: ({
    label,
    onBeforeNavigation,
    onClick,
  }: {
    label: string;
    onBeforeNavigation?: () => void;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  }) => {
    mockLinkChip({ label, onBeforeNavigation, onClick });

    return (
      <button
        onClick={(event) => {
          onBeforeNavigation?.();
          onClick?.(event);
        }}
        type="button"
      >
        {label}
      </button>
    );
  },
}));

describe('RecordChip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAtomStateValue.mockReturnValue(ViewOpenRecordInType.SIDE_PANEL);
  });

  it('runs the pre-navigation callback and keeps side-panel opening behavior', async () => {
    const user = userEvent.setup();
    const onBeforeNavigation = jest.fn();

    render(
      <RecordChip
        objectNameSingular="company"
        onBeforeNavigation={onBeforeNavigation}
        record={{ id: 'duplicate-company-id', name: 'Acme Corp' } as any}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Acme Corp' }));

    expect(onBeforeNavigation).toHaveBeenCalledTimes(1);
    expect(mockOpenRecordInCommandMenu).toHaveBeenCalledWith({
      objectNameSingular: 'company',
      recordId: 'duplicate-company-id',
    });
  });
});
