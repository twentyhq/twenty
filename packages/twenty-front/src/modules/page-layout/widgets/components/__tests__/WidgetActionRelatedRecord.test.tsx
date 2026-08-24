import { WidgetActionRelatedRecord } from '@/page-layout/widgets/components/WidgetActionRelatedRecord';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconPlus } from 'twenty-ui/icon';

jest.mock(
  '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton',
  () => ({
    WidgetCardHeaderActionButton: ({
      label,
      onClick,
      disabled,
    }: {
      label: string;
      onClick: () => void;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} disabled={disabled}>
        {label}
      </button>
    ),
  }),
);

const execute = jest.fn();

describe('WidgetActionRelatedRecord', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders and executes the shared action binding', async () => {
    const user = userEvent.setup();

    render(
      <WidgetActionRelatedRecord
        binding={{
          action: {
            id: 'create-task',
            label: 'Create task',
            Icon: IconPlus,
            isVisible: true,
            disabled: false,
            execute,
          },
          supportElement: <span>Action support</span>,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(execute).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Action support')).toBeVisible();
  });

  it('uses the shared disabled reason and hides unavailable actions', () => {
    const { rerender } = render(
      <WidgetActionRelatedRecord
        binding={{
          action: {
            id: 'create-calendar-event',
            label: 'Create calendar event',
            Icon: IconPlus,
            isVisible: true,
            disabled: true,
            disabledReason: 'Add an email first',
            execute,
          },
        }}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Add an email first' }),
    ).toBeDisabled();

    rerender(
      <WidgetActionRelatedRecord
        binding={{
          action: {
            id: 'create-calendar-event',
            label: 'Create calendar event',
            Icon: IconPlus,
            isVisible: false,
            disabled: false,
            execute,
          },
        }}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
