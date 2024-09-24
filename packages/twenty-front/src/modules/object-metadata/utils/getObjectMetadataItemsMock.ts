import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/objectMetadataItems';

// FIXME update these hard-coded values
export const COMPANY_LABEL_IDENTIFIER_FIELD_METADATA_ID = '39403bee-314b-4f14-bc91-70d500397517';
// FIXME update these hard-coded values
export const COMPANY_OBJECT_METADATA_ID = 'f1231579-8e7d-4b84-9a60-41844902f2c4';

export const getObjectMetadataItemsMock = (): ObjectMetadataItem[] => {
    return generatedMockObjectMetadataItems;
};
