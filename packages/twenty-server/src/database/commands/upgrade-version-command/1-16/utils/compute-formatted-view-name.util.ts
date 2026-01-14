import { capitalize, uncapitalize } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const ALL_ENTITY_VIEW_NAME = 'All {objectLabelPlural}';

export const computeFormattedViewName = ({
  viewName,
  flatObjectMetadata,
}: {
  viewName: string;
  flatObjectMetadata: FlatObjectMetadata;
}) =>
  viewName === ALL_ENTITY_VIEW_NAME
    ? `all${capitalize(flatObjectMetadata.namePlural)}`
    : uncapitalize(viewName.split(' ').map(capitalize).join(''));
