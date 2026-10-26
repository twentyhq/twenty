import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

import { EventFieldDiff } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiff';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

jest.mock('@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel', () => ({
  EventFieldDiffLabel: ({ fieldMetadataItem }: { fieldMetadataItem: FieldMetadataItem }) => (
    <span data-testid="field-label">{fieldMetadataItem.label}</span>
  ),
}));

jest.mock('@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect', () => ({
  EventFieldDiffValueEffect: () => null,
}));

jest.mock('@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue', () => ({
  EventFieldDiffValue: () => <span data-testid="field-value">Updated Value</span>,
}));

const mockFieldMetadataItem = {
  id: 'field-text-id',
  name: 'description',
  label: 'Description',
  type: FieldMetadataType.TEXT,
} as unknown as FieldMetadataItem;

const mockObjectMetadataItem = {
  nameSingular: 'company',
  namePlural: 'companies',
} as unknown as EnrichedObjectMetadataItem;

const renderWithI18n = (node: ReactNode) =>
  render(<I18nProvider i18n={i18n}>{node}</I18nProvider>);

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

describe('EventFieldDiff', () => {
  beforeAll(() => {
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  it('renders "Empty" when value is updated to empty', () => {
    renderWithI18n(
      <EventFieldDiff
        fieldDiff={{ before: 'Previous description', after: '' }}
        fieldMetadataItem={mockFieldMetadataItem}
        mainObjectMetadataItem={mockObjectMetadataItem}
        diffArtificialRecordStoreId="store-1"
      />,
    );

    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('renders field label and arrow', () => {
    renderWithI18n(
      <EventFieldDiff
        fieldDiff={{ before: 'Old', after: 'New' }}
        fieldMetadataItem={mockFieldMetadataItem}
        mainObjectMetadataItem={mockObjectMetadataItem}
        diffArtificialRecordStoreId="store-1"
      />,
    );

    expect(screen.getByTestId('field-label')).toHaveTextContent('Description');
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  describe('before -> after tooltip on hover', () => {
    it('shows full before -> after diff in tooltip when hovered', async () => {
      renderWithI18n(
        <EventFieldDiff
          fieldDiff={{
            before: 'Old long string value that was previously present',
            after: 'New long string value that was updated and could be truncated',
          }}
          fieldMetadataItem={mockFieldMetadataItem}
          mainObjectMetadataItem={mockObjectMetadataItem}
          diffArtificialRecordStoreId="store-1"
        />,
      );

      await userEvent.hover(screen.getByTestId('field-value'));

      expect(
        await screen.findByText(
          'Old long string value that was previously present → New long string value that was updated and could be truncated',
        ),
      ).toBeInTheDocument();
    });

    it('shows "before → Empty" in tooltip when value is cleared', async () => {
      renderWithI18n(
        <EventFieldDiff
          fieldDiff={{ before: 'Original value', after: null }}
          fieldMetadataItem={mockFieldMetadataItem}
          mainObjectMetadataItem={mockObjectMetadataItem}
          diffArtificialRecordStoreId="store-1"
        />,
      );

      await userEvent.hover(screen.getByText('Empty'));

      expect(await screen.findByText('Original value → Empty')).toBeInTheDocument();
    });
  });
});
