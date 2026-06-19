import {
  CreateOneObjectMetadataItemDocument,
  FindManyCommandMenuItemsDocument,
  FindManyNavigationMenuItemsDocument,
  FindManyViewsDocument,
} from '~/generated-metadata/graphql';

export const query = CreateOneObjectMetadataItemDocument;

export const findManyViewsQuery = FindManyViewsDocument;

export const findManyNavigationMenuItemsQuery =
  FindManyNavigationMenuItemsDocument;

export const findManyCommandMenuItemsQuery = FindManyCommandMenuItemsDocument;

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
  universalIdentifier: '',
  nameSingular: 'viewFilter',
  namePlural: 'viewFilters',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  color: null,
  description: '',
  icon: '',
  isRemote: false,
  isActive: true,
  isSystem: false,
  isUIEditable: true,
  isUICreatable: true,
  createdAt: '',
  updatedAt: '',
  labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
  imageIdentifierFieldMetadataId: '',
  applicationId: '',
  shortcut: null,
  isLabelSyncedWithName: false,
  isSearchable: false,
  duplicateCriteria: null,
  indexMetadataList: [],
  fieldsList: [],
};
