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

          if (labelIdentifierFieldMetadataItem) {
            switch (labelIdentifierFieldMetadataItem.type) {
              case FieldMetadataType.FullName: {
                if (searchFilterValue) {
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

                  if (fullNameFilter) {
                    searchFilter = fullNameFilter;
                  }
                }
                break;
              }
              default: {
                if (searchFilterValue) {
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
