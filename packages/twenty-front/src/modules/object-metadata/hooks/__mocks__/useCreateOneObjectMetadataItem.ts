import {
  CreateOneObjectMetadataItemDocument,
  FindManyCoreViewsDocument,
} from '~/generated-metadata/graphql';

export const query = CreateOneObjectMetadataItemDocument;

export const findManyCoreViewsQuery = FindManyCoreViewsDocument;

export const variables = {
  input: {
    object: {
      icon: 'IconPlus',
      labelPlural: 'View Filters',
      labelSingular: 'View Filter',
      nameSingular: 'viewFilter',
      namePlural: 'viewFilters',
    },
  },
};

export const responseData = {
  id: '',
  nameSingular: 'viewFilter',
  namePlural: 'viewFilters',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  description: '',
  icon: '',
  isCustom: false,
  isActive: true,
  isSearchable: false,
  createdAt: '',
  updatedAt: '',
  labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
  imageIdentifierFieldMetadataId: '',
};
