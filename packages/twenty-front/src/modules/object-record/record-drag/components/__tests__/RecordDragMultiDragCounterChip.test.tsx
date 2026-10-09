import { RecordDragMultiDragCounterChip } from '@/object-record/record-drag/components/RecordDragMultiDragCounterChip';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';

let mockDraggedRecordIds: string[] = [];

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockDraggedRecordIds,
  }),
);

jest.mock('twenty-ui/primitives/data-display', () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

describe('RecordDragMultiDragCounterChip', () => {
  it('shows the unformatted selection count only for multiple dragged records', () => {
    const { container, rerender } = render(<RecordDragMultiDragCounterChip />);

    expect(container).toBeEmptyDOMElement();

    mockDraggedRecordIds = ['record-1'];
    rerender(<RecordDragMultiDragCounterChip />);

    expect(container).toBeEmptyDOMElement();

    mockDraggedRecordIds = ['record-1', 'record-2'];
    rerender(<RecordDragMultiDragCounterChip />);

    expect(screen.getByText('2')).toBeVisible();

    mockDraggedRecordIds = Array.from(
      { length: 1000 },
      (_, index) => `record-${index}`,
    );
    rerender(<RecordDragMultiDragCounterChip />);

    expect(screen.getByText('1000')).toBeVisible();
  });
});
