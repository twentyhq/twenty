import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  LinksFilter,
  RecordGqlOperationFilter,
} from '@/object-record/graphql/types/RecordGqlOperationFilter';

import { CustomError } from '@/error-handler/CustomError';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isNonEmptyString } from '@sniptt/guards';

export const computeEmptyGqlOperationFilterForLinks = ({
  recordFilter,
  correspondingFieldMetadataItem,
}: {
  recordFilter: RecordFilter;
  correspondingFieldMetadataItem: Pick<FieldMetadataItem, 'name' | 'type'>;
}): RecordGqlOperationFilter => {
  const subFieldName = recordFilter.subFieldName;
  const isSubFieldFilter = isNonEmptyString(subFieldName);

  if (isSubFieldFilter) {
    switch (subFieldName) {
      case 'primaryLinkLabel': {
        return {
          or: [
            {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkLabel: { eq: '' },
              } satisfies LinksFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkLabel: { is: 'NULL' },
              } satisfies LinksFilter,
            },
          ],
        };
      }
      case 'primaryLinkUrl': {
        return {
          or: [
            {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkUrl: { eq: '' },
              } satisfies LinksFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkUrl: { is: 'NULL' },
              } satisfies LinksFilter,
            },
          ],
        };
      }
      case 'secondaryLinks': {
        return {
          or: [
            {
              [correspondingFieldMetadataItem.name]: {
                secondaryLinks: { is: 'NULL' },
              } satisfies LinksFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                secondaryLinks: { like: '[]' },
              } satisfies LinksFilter,
            },
          ],
        };
      }
      default: {
        throw new CustomError(
          `Unknown subfield name ${subFieldName}`,
          'UNKNOWN_SUBFIELD_NAME',
        );
      }
    }
  }

  return {
    and: [
      {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkLabel: { eq: '' },
            } satisfies LinksFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkLabel: { is: 'NULL' },
            } satisfies LinksFilter,
          },
        ],
      },
      {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkUrl: { eq: '' },
            } satisfies LinksFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkUrl: { is: 'NULL' },
            } satisfies LinksFilter,
          },
        ],
      },
      {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              secondaryLinks: { is: 'NULL' },
            } satisfies LinksFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              secondaryLinks: { like: '[]' },
            } satisfies LinksFilter,
          },
        ],
      },
    ],
  };
};
