import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';

const mockVisibleRecordFields = Array.from({ length: 7 }, (_, index) => ({
  fieldMetadataItemId: `field-id-${index}`,
}));

const mockRecordStore = {
  id: 'record-id',
  ...Object.fromEntries(
    mockVisibleRecordFields.map((_, index) => [
      `field${index}`,
      `value-${index}`,
    ]),
  ),
};

const mockFieldDefinitionByFieldMetadataItemId = Object.fromEntries(
  mockVisibleRecordFields.map(({ fieldMetadataItemId }, index) => [
    fieldMetadataItemId,
    { metadata: { fieldName: `field${index}` } },
  ]),
);

let mockRecordListRowWidth = 10_000;
const mockOpenRecordFromIndexView = jest.fn();

jest.mock('@/object-record/hooks/useRecordChipData', () => ({
  useRecordChipData: () => ({
    recordChipData: {
      recordId: 'record-id',
      name: 'Record label',
      avatarType: 'rounded',
      avatarUrl: '',
      isLabelIdentifier: true,
      objectNameSingular: 'company',
    },
  }),
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
      openRecordFromIndexView: mockOpenRecordFromIndexView,
    }),
  }),
);

jest.mock('@/object-record/record-index/hooks/useResolveOpenRecordIn', () => ({
  useResolveOpenRecordIn: () => undefined,
}));

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: jest.fn(),
  }),
}));

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

const renderRecordListRow = () =>
  render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <RecordListRow recordId="record-id" />
    </MemoryRouter>,
  );

describe('RecordListRow', () => {
  beforeEach(() => {
    mockRecordListRowWidth = 10_000;
    mockOpenRecordFromIndexView.mockClear();
  });

  it('renders every selected populated field without a six-field limit', () => {
    renderRecordListRow();

    for (const { fieldMetadataItemId } of mockVisibleRecordFields) {
      expect(screen.getByText(fieldMetadataItemId)).toBeVisible();
    }

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('uses medium weight for the record identifier', () => {
    renderRecordListRow();

    expect(screen.getByTestId('chip').className).toContain('fontMedium');
  });

  it('shows a clickable overflow chip once fields no longer fit', async () => {
    const user = userEvent.setup();

    mockRecordListRowWidth = 800;

    renderRecordListRow();

    const overflowChip = screen.getByRole('link', { name: '+1' });
    const overflowChipLabel = screen.getByText('+1');

    expect(overflowChip).toBeVisible();
    expect(screen.queryByText('field-id-6')).not.toBeInTheDocument();

    await user.hover(overflowChipLabel);

    expect(
      await screen.findByText('1 more populated field available'),
    ).toBeVisible();

    await user.click(overflowChip);

    expect(mockOpenRecordFromIndexView).toHaveBeenCalledWith({
      recordId: 'record-id',
    });
  });
});
