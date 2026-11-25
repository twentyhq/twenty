import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { ALL_VIEW_FIELDS } from 'src/constants/all-view-fields';

export const findAllViewsMissingFields = async (): Promise<string[]> => {
  const { currentWorkspace, objects, getViews } =
    await new MetadataApiClient().query({
      currentWorkspace: { workspaceCustomApplicationId: true },
      objects: {
        __args: {
          filter: {
            universalIdentifier: {
              in: ALL_VIEW_FIELDS.map(
                ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
              ),
            },
          },
          paging: { first: ALL_VIEW_FIELDS.length },
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
        name: true,
        isActive: true,
        applicationId: true,
        objectMetadataId: true,
        viewFields: { fieldMetadataId: true, isVisible: true, isActive: true },
      },
    });

  return ALL_VIEW_FIELDS.filter(
    ({ objectUniversalIdentifier, objectLabelPlural, fields }) => {
      const object = objects.edges.find(
        ({ node }) => node.universalIdentifier === objectUniversalIdentifier,
      )?.node;

      if (!isDefined(object)) {
        return false;
      }

      const allViews = getViews.filter(
        (view) =>
          view.objectMetadataId === object.id &&
          view.applicationId ===
            currentWorkspace.workspaceCustomApplicationId &&
          view.isActive &&
          [`All ${objectLabelPlural}`, 'All {objectLabelPlural}'].includes(
            view.name,
          ),
      );

      return allViews.some((view) => {
        const shownFieldMetadataIds = view.viewFields
          .filter(({ isVisible, isActive }) => isVisible && isActive)
          .map(({ fieldMetadataId }) => fieldMetadataId);

        return object.fieldsList.some(
          ({ id, universalIdentifier }) =>
            fields.some(
              (field) => field.universalIdentifier === universalIdentifier,
            ) && !shownFieldMetadataIds.includes(id),
        );
      });
    },
  ).map(({ objectLabelPlural }) => objectLabelPlural);
};
