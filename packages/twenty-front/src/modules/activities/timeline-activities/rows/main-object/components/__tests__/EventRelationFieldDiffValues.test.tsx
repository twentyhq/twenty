import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

import { EventRelationFieldDiffValues } from '@/activities/timeline-activities/rows/main-object/components/EventRelationFieldDiffValues';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: jest.fn(),
}));

// getObjectRecordIdentifier depends on label-identifier metadata; mocking it to
// echo the record name keeps these tests focused on the diff rendering logic.
jest.mock('@/object-metadata/utils/getObjectRecordIdentifier', () => ({
  getObjectRecordIdentifier: jest.fn(),
}));

const { useFindManyRecords } = jest.requireMock(
  '@/object-record/hooks/useFindManyRecords',
);
const { useObjectMetadataItem } = jest.requireMock(
  '@/object-metadata/hooks/useObjectMetadataItem',
);
const { getObjectRecordIdentifier } = jest.requireMock(
  '@/object-metadata/utils/getObjectRecordIdentifier',
);

const WORKSPACE_MEMBER_RECORDS = [
  { id: 'before-id', name: 'Tim A' },
  { id: 'after-id', name: 'Tim Apple' },
];

const relationFieldMetadataItem = {
  id: 'field-account-owner',
  name: 'accountOwner',
  type: FieldMetadataType.RELATION,
  relation: {
    targetObjectMetadata: { nameSingular: 'workspaceMember' },
  },
} as unknown as FieldMetadataItem;

const renderWithI18n = (node: ReactNode) =>
  render(<I18nProvider i18n={i18n}>{node}</I18nProvider>);

// react-tooltip relies on floating-ui, which needs ResizeObserver; jsdom does
// not provide one, so we stub it for the hover-tooltip assertions.
class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

describe('EventRelationFieldDiffValues', () => {
  beforeAll(() => {
    global.ResizeObserver =
      ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  beforeEach(() => {
    useObjectMetadataItem.mockReturnValue({
      objectMetadataItem: { nameSingular: 'workspaceMember' },
    });
    useFindManyRecords.mockReturnValue({
      records: WORKSPACE_MEMBER_RECORDS,
      loading: false,
    });
    getObjectRecordIdentifier.mockImplementation(
      ({ record }: { record: { name: string } }) => ({ name: record.name }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Regression test: clearing a relation must show "Empty", not the stale
  // previous value. value -> null is the only transition where `after` is null
  // while `before` is set, so it is the one that previously rendered the old
  // value as if nothing had changed.
  it('renders "Empty" when a relation is changed from a value to null', () => {
    renderWithI18n(
      <EventRelationFieldDiffValues
        fieldDiff={{ before: { id: 'before-id' }, after: { id: null } }}
        fieldMetadataItem={relationFieldMetadataItem}
      />,
    );

    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByText('Tim A')).not.toBeInTheDocument();
  });

  it('renders the new record name when a relation is set from null to a value', () => {
    renderWithI18n(
      <EventRelationFieldDiffValues
        fieldDiff={{ before: { id: null }, after: { id: 'after-id' } }}
        fieldMetadataItem={relationFieldMetadataItem}
      />,
    );

    expect(screen.getByText('Tim Apple')).toBeInTheDocument();
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('renders only the after record name when a relation changes from one value to another', () => {
    renderWithI18n(
      <EventRelationFieldDiffValues
        fieldDiff={{ before: { id: 'before-id' }, after: { id: 'after-id' } }}
        fieldMetadataItem={relationFieldMetadataItem}
      />,
    );

    expect(screen.getByText('Tim Apple')).toBeInTheDocument();
    expect(screen.queryByText('Tim A')).not.toBeInTheDocument();
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  // Hovering the value reveals a tooltip with the full before -> after change,
  // even though only the after value is shown inline.
  describe('before -> after tooltip on hover', () => {
    it('does not render the tooltip until the value is hovered', () => {
      renderWithI18n(
        <EventRelationFieldDiffValues
          fieldDiff={{ before: { id: 'before-id' }, after: { id: null } }}
          fieldMetadataItem={relationFieldMetadataItem}
        />,
      );

      expect(screen.queryByText('Tim A → Empty')).not.toBeInTheDocument();
    });

    it('shows "before → Empty" when a relation is cleared', async () => {
      renderWithI18n(
        <EventRelationFieldDiffValues
          fieldDiff={{ before: { id: 'before-id' }, after: { id: null } }}
          fieldMetadataItem={relationFieldMetadataItem}
        />,
      );

      fireEvent.mouseEnter(screen.getByText('Empty'));

      expect(await screen.findByText('Tim A → Empty')).toBeInTheDocument();
    });

    it('shows "Empty → after" when a relation is set from null', async () => {
      renderWithI18n(
        <EventRelationFieldDiffValues
          fieldDiff={{ before: { id: null }, after: { id: 'after-id' } }}
          fieldMetadataItem={relationFieldMetadataItem}
        />,
      );

      fireEvent.mouseEnter(screen.getByText('Tim Apple'));

      expect(await screen.findByText('Empty → Tim Apple')).toBeInTheDocument();
    });

    it('shows "before → after" when a relation changes between two values', async () => {
      renderWithI18n(
        <EventRelationFieldDiffValues
          fieldDiff={{ before: { id: 'before-id' }, after: { id: 'after-id' } }}
          fieldMetadataItem={relationFieldMetadataItem}
        />,
      );

      fireEvent.mouseEnter(screen.getByText('Tim Apple'));

      expect(await screen.findByText('Tim A → Tim Apple')).toBeInTheDocument();
    });
  });

  // Fallback branch: when the relation has no target object metadata, the
  // component skips the fetch and renders directly from the raw id.
  describe('without a relation target object metadata', () => {
    const fieldMetadataItemWithoutTarget = {
      id: 'field-account-owner',
      name: 'accountOwner',
      type: FieldMetadataType.RELATION,
    } as unknown as FieldMetadataItem;

    it('renders "Empty" when changed from a value to null', () => {
      renderWithI18n(
        <EventRelationFieldDiffValues
          fieldDiff={{ before: { id: 'before-id' }, after: { id: null } }}
          fieldMetadataItem={fieldMetadataItemWithoutTarget}
        />,
      );

      expect(screen.getByText('Empty')).toBeInTheDocument();
    });

    it('renders the raw record id when set to a value', () => {
      renderWithI18n(
        <EventRelationFieldDiffValues
          fieldDiff={{ before: { id: null }, after: { id: 'after-id' } }}
          fieldMetadataItem={fieldMetadataItemWithoutTarget}
        />,
      );

      expect(screen.getByText('after-id')).toBeInTheDocument();
    });
  });
});
