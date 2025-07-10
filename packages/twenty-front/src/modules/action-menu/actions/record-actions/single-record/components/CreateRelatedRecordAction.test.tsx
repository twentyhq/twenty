import { fireEvent, render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RelationType } from '~/generated-metadata/graphql';
import { CreateRelatedRecordAction } from './CreateRelatedRecordAction';

// Mock the hooks
jest.mock(
  '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow',
);
jest.mock('@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow');
jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/record-table/hooks/useCreateNewIndexRecord');

const mockUseSelectedRecordIdOrThrow =
  require('@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow').useSelectedRecordIdOrThrow;
const mockUseContextStoreObjectMetadataItemOrThrow =
  require('@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow').useContextStoreObjectMetadataItemOrThrow;
const mockUseObjectMetadataItem =
  require('@/object-metadata/hooks/useObjectMetadataItem').useObjectMetadataItem;
const mockUseCreateNewIndexRecord =
  require('@/object-record/record-table/hooks/useCreateNewIndexRecord').useCreateNewIndexRecord;

describe('CreateRelatedRecordAction', () => {
  const mockCreateNewIndexRecord = jest.fn();
  const mockSourceRecordId = 'source-record-id';

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSelectedRecordIdOrThrow.mockReturnValue(mockSourceRecordId);
    mockUseCreateNewIndexRecord.mockReturnValue({
      createNewIndexRecord: mockCreateNewIndexRecord,
    });
  });

  it('should create a record with ONE_TO_MANY relation', () => {
    const mockSourceObjectMetadataItem = {
      fields: [
        {
          type: 'RELATION',
          relation: {
            type: RelationType.ONE_TO_MANY,
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Person,
            },
            targetFieldMetadata: {
              name: 'company',
            },
          },
        },
      ],
    };

    const mockTargetObjectMetadataItem = {
      nameSingular: CoreObjectNameSingular.Person,
    };

    mockUseContextStoreObjectMetadataItemOrThrow.mockReturnValue({
      objectMetadataItem: mockSourceObjectMetadataItem,
    });

    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: mockTargetObjectMetadataItem,
    });

    render(
      <RecoilRoot>
        <CreateRelatedRecordAction recordType={CoreObjectNameSingular.Person} />
      </RecoilRoot>,
    );

    const action = screen.getByRole('button');
    fireEvent.click(action);

    expect(mockCreateNewIndexRecord).toHaveBeenCalledWith({
      companyId: mockSourceRecordId,
    });
  });

  it('should create a record with MANY_TO_ONE relation', () => {
    const mockSourceObjectMetadataItem = {
      fields: [
        {
          type: 'RELATION',
          relation: {
            type: RelationType.MANY_TO_ONE,
            targetObjectMetadata: {
              nameSingular: CoreObjectNameSingular.Person,
            },
            sourceFieldMetadata: {
              name: 'company',
            },
          },
        },
      ],
    };

    const mockTargetObjectMetadataItem = {
      nameSingular: CoreObjectNameSingular.Person,
    };

    mockUseContextStoreObjectMetadataItemOrThrow.mockReturnValue({
      objectMetadataItem: mockSourceObjectMetadataItem,
    });

    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: mockTargetObjectMetadataItem,
    });

    render(
      <RecoilRoot>
        <CreateRelatedRecordAction recordType={CoreObjectNameSingular.Person} />
      </RecoilRoot>,
    );

    const action = screen.getByRole('button');
    fireEvent.click(action);

    expect(mockCreateNewIndexRecord).toHaveBeenCalledWith({
      companyId: mockSourceRecordId,
    });
  });

  it('should create a record without relation when no relation field is found', () => {
    const mockSourceObjectMetadataItem = {
      fields: [
        {
          type: 'TEXT',
          name: 'name',
        },
      ],
    };

    const mockTargetObjectMetadataItem = {
      nameSingular: CoreObjectNameSingular.Person,
    };

    mockUseContextStoreObjectMetadataItemOrThrow.mockReturnValue({
      objectMetadataItem: mockSourceObjectMetadataItem,
    });

    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: mockTargetObjectMetadataItem,
    });

    render(
      <RecoilRoot>
        <CreateRelatedRecordAction recordType={CoreObjectNameSingular.Person} />
      </RecoilRoot>,
    );

    const action = screen.getByRole('button');
    fireEvent.click(action);

    expect(mockCreateNewIndexRecord).toHaveBeenCalledWith();
  });

  it('should create a record without relation when relation field has no relation data', () => {
    const mockSourceObjectMetadataItem = {
      fields: [
        {
          type: 'RELATION',
          relation: null,
        },
      ],
    };

    const mockTargetObjectMetadataItem = {
      nameSingular: CoreObjectNameSingular.Person,
    };

    mockUseContextStoreObjectMetadataItemOrThrow.mockReturnValue({
      objectMetadataItem: mockSourceObjectMetadataItem,
    });

    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: mockTargetObjectMetadataItem,
    });

    render(
      <RecoilRoot>
        <CreateRelatedRecordAction recordType={CoreObjectNameSingular.Person} />
      </RecoilRoot>,
    );

    const action = screen.getByRole('button');
    fireEvent.click(action);

    expect(mockCreateNewIndexRecord).toHaveBeenCalledWith();
  });
});
