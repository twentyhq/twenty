import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';

describe('FieldDescriptionTooltip', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the field label and description after a long hover', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <>
        <span id="amount-field-label">Amount</span>
        <FieldDescriptionTooltip
          anchorSelect="#amount-field-label"
          fieldDescription="The $ amount of this opportunity"
          fieldLabel="Amount"
        />
      </>,
    );

    await user.hover(screen.getByText('Amount'));

    act(() => jest.advanceTimersByTime(999));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1));

    const tooltip = screen.getByRole('tooltip');

    expect(within(tooltip).getByText('Amount')).toBeInTheDocument();
    expect(
      within(tooltip).getByText('The $ amount of this opportunity'),
    ).toBeInTheDocument();
  });

  it('shows the field label and description after keyboard focus', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <>
        <span id="amount-field-label" tabIndex={0}>
          Amount
        </span>
        <FieldDescriptionTooltip
          anchorSelect="#amount-field-label"
          fieldDescription="The $ amount of this opportunity"
          fieldLabel="Amount"
        />
      </>,
    );

    await user.tab();

    act(() => jest.advanceTimersByTime(999));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1));

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('does not render when the field has no description', () => {
    const { container } = render(
      <FieldDescriptionTooltip
        anchorSelect="#amount-field-label"
        fieldDescription=""
        fieldLabel="Amount"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
