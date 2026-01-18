import { createState } from 'twenty-ui/utilities';

export type LastFieldMetadataItemUpdate = {
  fieldMetadataItemId: string;
  objectMetadataId: string;
  timestamp: number;
} | null;

export const lastFieldMetadataItemUpdateState =
  createState<LastFieldMetadataItemUpdate>({
    key: 'lastFieldMetadataItemUpdateState',
    defaultValue: null,
  });
