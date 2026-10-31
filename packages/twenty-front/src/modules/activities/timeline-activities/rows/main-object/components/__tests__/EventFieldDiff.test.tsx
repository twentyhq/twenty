import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

import { EventFieldDiff } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiff';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

jest.mock(
  '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel',
  () => ({
    EventFieldDiffLabel: ({
      fieldMetadataItem,
    }: {
      fieldMetadataItem: FieldMetadataItem;
    }) => <div data-testid="diff-label">{fieldMetadataItem.label}</div>,
  }),
);

jest.mock(
  '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue',
  () => ({
    EventFieldDiffValue: ({
      fieldMetadataItem,
    }: {
      fieldMetadataItem: FieldMetadataItem;
    }) => <div data-testid="diff-value">{fieldMetadataItem.name}</div>,
  }),
);

jest.mock(
  '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect',
  () => ({
    EventFieldDiffValueEffect: () => null,
  }),
);

jest.mock(
  '@/activities/timeline-activities/rows/main-object/components/EventRelationFieldDiffValues',
  () => ({
    EventRelationFieldDiffValues: () => (
      <div data-testid="diff-relation-values" />
    ),
  }),
);

const renderWithI18n = (node: ReactNode) =>
  render(<I18nProvider i18n={i18n}>{node}</I18nProvider>);

const mockMainObjectMetadataItem = {
  id: 'company-id',
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
} as unknown as EnrichedObjectMetadataItem;

const mockTextFieldMetadataItem = {
  id: 'field-description',
  name: 'description',
  label: 'Description',
  type: FieldMetadataType.TEXT,
} as unknown as FieldMetadataItem;

const mockRelationFieldMetadataItem = {
  id: 'field-account-owner',
  name: 'accountOwner',
  label: 'Account Owner',
  type: FieldMetadataType.RELATION,
  relation: {
    targetObjectMetadata: { nameSingular: 'workspaceMember' },
  },
} as unknown as FieldMetadataItem;

describe('EventFieldDiff', () => {
  it('renders "Empty" when a field value is updated to null or empty', () => {
    renderWithI18n(
      <EventFieldDiff
        fieldDiff={{ before: 'old value', after: null }}
        fieldMetadataItem={mockTextFieldMetadataItem}
        mainObjectMetadataItem={mockMainObjectMetadataItem}
        diffArtificialRecordStoreId="store-id-1"
      />,
    );

    expect(screen.getByTestId('diff-label')).toHaveTextContent('Description');
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByTestId('diff-value')).not.toBeInTheDocument();
  });

  it('renders diff label, arrow, and diff value when updated to a non-empty string', () => {
    renderWithI18n(
      <EventFieldDiff
        fieldDiff={{
          before: 'short',
          after: 'a very long description that might overflow in the timeline',
        }}
        fieldMetadataItem={mockTextFieldMetadataItem}
        mainObjectMetadataItem={mockMainObjectMetadataItem}
        diffArtificialRecordStoreId="store-id-2"
      />,
    );

    expect(screen.getByTestId('diff-label')).toHaveTextContent('Description');
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByTestId('diff-value')).toHaveTextContent('description');
  });

  it('delegates to EventRelationFieldDiffValues when the field is a relation', () => {
    renderWithI18n(
      <EventFieldDiff
        fieldDiff={{
          before: { id: 'member-1' },
          after: { id: 'member-2' },
        }}
        fieldMetadataItem={mockRelationFieldMetadataItem}
        mainObjectMetadataItem={mockMainObjectMetadataItem}
        diffArtificialRecordStoreId="store-id-3"
      />,
    );

    expect(screen.getByTestId('diff-label')).toHaveTextContent('Account Owner');
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByTestId('diff-relation-values')).toBeInTheDocument();
  });
});
