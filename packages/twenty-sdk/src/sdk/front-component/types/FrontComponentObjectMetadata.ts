import { type FieldMetadataType, type TagColor } from 'twenty-shared/types';

import { type FrontComponentSelectedObjectMetadata } from './FrontComponentSelectedObjectMetadata';

export type FrontComponentObjectMetadata =
  FrontComponentSelectedObjectMetadata & {
    labelSingular: string;
    labelPlural: string;
    fields: {
      id: string;
      name: string;
      label: string;
      type: `${FieldMetadataType}`;
      options:
        | {
            value: string;
            label: string;
            position: number;
            color?: TagColor;
          }[]
        | null;
    }[];
  };
