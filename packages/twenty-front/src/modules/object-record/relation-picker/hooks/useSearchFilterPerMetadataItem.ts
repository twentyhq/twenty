import { isNonEmptyString } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { makeOrFilterVariables } from '@/object-record/utils/makeOrFilterVariables';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useSearchFilterPerMetadataItem = ({
  objectMetadataItems,
  searchFilterValue,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  searchFilterValue: string;
}) => {
  const searchFilterPerMetadataItemNameSingular =
    Object.fromEntries<ObjectRecordQueryFilter>(
      objectMetadataItems
        .map((objectMetadataItem) => {
          if (searchFilterValue === '') return null;

          const labelIdentifierFieldMetadataItem =
            getLabelIdentifierFieldMetadataItem(objectMetadataItem);

          let searchFilter: ObjectRecordQueryFilter = {};

          if (isDefined(labelIdentifierFieldMetadataItem)) {
            switch (labelIdentifierFieldMetadataItem.type) {
              case FieldMetadataType.FullName: {
                if (isNonEmptyString(searchFilterValue)) {
                  const fullNameFilter = makeOrFilterVariables([
                    {
                      [labelIdentifierFieldMetadataItem.name]: {
                        firstName: {
                          ilike: `%${searchFilterValue}%`,
                        },
                      },
                    },
                    {
                      [labelIdentifierFieldMetadataItem.name]: {
                        lastName: {
                          ilike: `%${searchFilterValue}%`,
                        },
                      },
                    },
                  ]);

                  if (isDefined(fullNameFilter)) {
                    searchFilter = fullNameFilter;
                  }
                }
                break;
              }
              default: {
                if (isNonEmptyString(searchFilterValue)) {
                  searchFilter = {
                    [labelIdentifierFieldMetadataItem.name]: {
                      ilike: `%${searchFilterValue}%`,
                    },
                  };
                }
              }
            }
          }

          return [objectMetadataItem.nameSingular, searchFilter] as const;
        })
        .filter(isDefined),
    );

  return {
    searchFilterPerMetadataItemNameSingular,
  };
};
