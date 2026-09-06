import { render, screen } from '@testing-library/react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordDetailRelationSectionDropdown } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSectionDropdown';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RelationType } from '~/generated-metadata/graphql';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: jest.fn(),
}));

jest.mock('@/object-record/read-only/hooks/useIsRecordReadOnly', () => ({
  useIsRecordReadOnly: jest.fn(),
}));

jest.mock(
  '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSectionDropdownToOne',
  () => ({
    RecordDetailRelationSectionDropdownToOne: () => (
      <div data-testid="dropdown-to-one" />
    ),
  }),
);

jest.mock(
  '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSectionDropdownToMany',
  () => ({
    RecordDetailRelationSectionDropdownToMany: () => (
      <div data-testid="dropdown-to-many" />
    ),
  }),
);

describe('RecordDetailRelationSectionDropdown', () => {
  const mockUseObjectMetadataItem = useObjectMetadataItem as jest.Mock;
  const mockUseIsRecordReadOnly = useIsRecordReadOnly as jest.Mock;

  const companyRecordId = 'company-123';
  const companyObjectMetadataId = 'meta-company-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        id: companyObjectMetadataId,
        nameSingular: 'company',
      },
    });
    mockUseIsRecordReadOnly.mockReturnValue(false);
  });

  const renderComponent = ({
    loading = false,
    isRecordFieldReadOnly = false,
    relationType = RelationType.ONE_TO_MANY,
  }: {
    loading?: boolean;
    isRecordFieldReadOnly?: boolean;
    relationType?: RelationType;
  } = {}) => {
    return render(
      <FieldContext.Provider
        value={
          {
            recordId: companyRecordId,
            isRecordFieldReadOnly,
            fieldDefinition: {
              metadata: {
                relationType,
                objectMetadataNameSingular: 'company',
                relationObjectMetadataNameSingular: 'product',
              },
            },
          } as any
        }
      >
        <RecordDetailRelationSectionDropdown loading={loading} />
      </FieldContext.Provider>,
    );
  };

  it('checks read-only state using parent recordId and parent objectMetadataId', () => {
    renderComponent({ relationType: RelationType.ONE_TO_MANY });

    expect(mockUseIsRecordReadOnly).toHaveBeenCalledWith({
      recordId: companyRecordId,
      objectMetadataId: companyObjectMetadataId,
    });
    expect(screen.getByTestId('dropdown-to-many')).toBeInTheDocument();
  });

  it('renders dropdown-to-one when relation is MANY_TO_ONE', () => {
    renderComponent({ relationType: RelationType.MANY_TO_ONE });

    expect(mockUseIsRecordReadOnly).toHaveBeenCalledWith({
      recordId: companyRecordId,
      objectMetadataId: companyObjectMetadataId,
    });
    expect(screen.getByTestId('dropdown-to-one')).toBeInTheDocument();
  });

  it('renders null when parent record is read-only', () => {
    mockUseIsRecordReadOnly.mockReturnValue(true);

    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders null when relation field is read-only', () => {
    const { container } = renderComponent({ isRecordFieldReadOnly: true });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders null when loading is true', () => {
    const { container } = renderComponent({ loading: true });

    expect(container).toBeEmptyDOMElement();
  });
});
