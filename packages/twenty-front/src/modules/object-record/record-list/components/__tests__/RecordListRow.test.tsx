import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';

const mockVisibleRecordFields = Array.from({ length: 7 }, (_, index) => ({
  fieldMetadataItemId: `field-id-${index}`,
}));

const mockRecordStore = Object.fromEntries(
  mockVisibleRecordFields.map((_, index) => [
    `field${index}`,
    `value-${index}`,
  ]),
);

const mockFieldDefinitionByFieldMetadataItemId = Object.fromEntries(
  mockVisibleRecordFields.map(({ fieldMetadataItemId }, index) => [
    fieldMetadataItemId,
    { metadata: { fieldName: `field${index}` } },
  ]),
);

let mockRecordListRowWidth = 10_000;

jest.mock('@/object-record/components/RecordChip', () => ({
  RecordChip: ({ isBold }: { isBold?: boolean }) => (
    <span data-font-weight={isBold ? 'medium' : 'regular'}>Record label</span>
  ),
}));

jest.mock(
  '@/object-record/record-board/record-board-card/components/StopPropagationContainer',
  () => ({
    StopPropagationContainer: ({ children }: { children: ReactNode }) => (
      <>{children}</>
    ),
  }),
);

jest.mock(
  '@/object-record/record-field/states/visibleRecordFieldsComponentSelector',
  () => ({
    visibleRecordFieldsComponentSelector: {},
  }),
);

jest.mock('@/object-record/record-field/ui/utils/isFieldValueEmpty', () => ({
  isFieldValueEmpty: () => false,
}));

jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    labelIdentifierFieldMetadataItem: undefined,
    fieldDefinitionByFieldMetadataItemId:
      mockFieldDefinitionByFieldMetadataItemId,
  }),
}));

jest.mock(
  '@/object-record/record-index/hooks/useOpenRecordFromIndexView',
  () => ({
    useOpenRecordFromIndexView: () => ({
      openRecordFromIndexView: jest.fn(),
    }),
  }),
);

jest.mock('@/object-record/record-list/components/RecordListRowField', () => ({
  RecordListRowField: ({
    recordField,
  }: {
    recordField: { fieldMetadataItemId: string };
  }) => <span>{recordField.fieldMetadataItemId}</span>,
}));

jest.mock('@/object-record/record-list/contexts/RecordListContext', () => ({
  useRecordListContextOrThrow: () => ({
    objectNameSingular: 'company',
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => mockVisibleRecordFields,
  }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockRecordListRowWidth,
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue', () => ({
  useAtomFamilyStateValue: () => mockRecordStore,
}));

describe('RecordListRow', () => {
  beforeEach(() => {
    mockRecordListRowWidth = 10_000;
  });

  it('renders every selected populated field without a six-field limit', () => {
    render(<RecordListRow recordId="record-id" />);

    for (const { fieldMetadataItemId } of mockVisibleRecordFields) {
      expect(screen.getByText(fieldMetadataItemId)).toBeVisible();
    }

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('uses medium weight for the record identifier', () => {
    render(<RecordListRow recordId="record-id" />);

    expect(screen.getByText('Record label')).toHaveAttribute(
      'data-font-weight',
      'medium',
    );
  });

  it('shows a clickable overflow chip once fields no longer fit', async () => {
    const user = userEvent.setup();

    mockRecordListRowWidth = 800;

    render(<RecordListRow recordId="record-id" />);

    const overflowChipLabel = screen.getByText('+1');

    expect(overflowChipLabel).toBeVisible();
    expect(screen.queryByText('field-id-6')).not.toBeInTheDocument();

    await user.hover(overflowChipLabel);

    expect(
      await screen.findByText('1 more populated field available'),
    ).toBeVisible();
  });
});
