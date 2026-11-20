import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import {
  INDEX_VIEW_FIELDS,
  type IndexViewFields,
} from 'src/constants/index-view-fields';

export const findMissingIndexViewFields = async (): Promise<
  IndexViewFields[]
> => {
  const { objects, getViews } = await new MetadataApiClient().query({
    objects: {
      __args: {
        filter: {
          universalIdentifier: {
            in: INDEX_VIEW_FIELDS.map(
              ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
            ),
          },
        },
        paging: { first: INDEX_VIEW_FIELDS.length },
      },
      edges: {
        node: {
          id: true,
          universalIdentifier: true,
          fieldsList: { id: true, universalIdentifier: true },
        },
      },
    },
    getViews: {
      __args: { viewTypes: ['TABLE'] },
      key: true,
      objectMetadataId: true,
      viewFields: { fieldMetadataId: true, isVisible: true },
    },
  });

  return INDEX_VIEW_FIELDS.flatMap((indexViewFields) => {
    const object = objects.edges.find(
      ({ node }) =>
        node.universalIdentifier === indexViewFields.objectUniversalIdentifier,
    )?.node;

    const indexView = getViews.find(
      (view) => view.objectMetadataId === object?.id && view.key === 'INDEX',
    );

    if (!isDefined(object) || !isDefined(indexView)) {
      return [];
    }

    const visibleFieldMetadataIds = indexView.viewFields
      .filter(({ isVisible }) => isVisible)
      .map(({ fieldMetadataId }) => fieldMetadataId);

    const missingFields = indexViewFields.fields.filter((field) => {
      const fieldMetadata = object.fieldsList.find(
        ({ universalIdentifier }) =>
          universalIdentifier === field.universalIdentifier,
      );

      return (
        isDefined(fieldMetadata) &&
        !visibleFieldMetadataIds.includes(fieldMetadata.id)
      );
    });

    return missingFields.length > 0
      ? [{ ...indexViewFields, fields: missingFields }]
      : [];
  });
};
