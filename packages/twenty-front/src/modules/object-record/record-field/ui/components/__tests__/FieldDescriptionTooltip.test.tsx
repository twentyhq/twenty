import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { FieldDescriptionTooltip } from '@/object-record/record-field/ui/components/FieldDescriptionTooltip';

describe('FieldDescriptionTooltip', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the field label and description after a long hover', () => {
    jest.useFakeTimers();

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

    fireEvent.mouseOver(screen.getByText('Amount'));

    act(() => jest.advanceTimersByTime(999));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1));

    const tooltip = screen.getByRole('tooltip');

    expect(within(tooltip).getByText('Amount')).toBeInTheDocument();
    expect(
      within(tooltip).getByText('The $ amount of this opportunity'),
    ).toBeInTheDocument();
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
