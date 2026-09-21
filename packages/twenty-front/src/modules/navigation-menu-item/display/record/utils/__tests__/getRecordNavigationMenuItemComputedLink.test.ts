import { getRecordNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/record/utils/getRecordNavigationMenuItemComputedLink';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const WORKFLOW_OBJECT_METADATA_ID = 'workflow-object-metadata-id';
const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';

const objectMetadataItems = [
  {
    id: WORKFLOW_OBJECT_METADATA_ID,
    nameSingular: 'workflow',
    namePlural: 'workflows',
    fields: [],
  },
  {
    id: COMPANY_OBJECT_METADATA_ID,
    nameSingular: 'company',
    namePlural: 'companies',
    fields: [],
  },
] as unknown as EnrichedObjectMetadataItem[];

describe('getRecordNavigationMenuItemComputedLink', () => {
  it('opens a workflow favorite on the core route', () => {
    expect(
      getRecordNavigationMenuItemComputedLink(
        {
          targetObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
          targetRecordIdentifier: {
            id: 'core-workflow-id',
            labelIdentifier: 'My workflow',
          },
        },
        objectMetadataItems,
      ),
    ).toBe('/workflow-core/core-workflow-id');
  });

  it('leaves a non-workflow favorite on its record show page', () => {
    expect(
      getRecordNavigationMenuItemComputedLink(
        {
          targetObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
          targetRecordIdentifier: {
            id: 'company-id',
            labelIdentifier: 'Acme',
          },
        },
        objectMetadataItems,
      ),
    ).toBe('/object/company/company-id');
  });

  it('returns no link when the target record identifier could not be resolved', () => {
    expect(
      getRecordNavigationMenuItemComputedLink(
        {
          targetObjectMetadataId: WORKFLOW_OBJECT_METADATA_ID,
          targetRecordIdentifier: null,
        },
        objectMetadataItems,
      ),
    ).toBe('');
  });
});
