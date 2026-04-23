import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';

const METADATA_NAME_TO_ENTITY_KEY: Record<string, MetadataEntityKey> = {
  objectMetadata: 'objectMetadataItems',
  fieldMetadata: 'fieldMetadataItems',
  index: 'indexMetadataItems',
  view: 'views',
  viewField: 'viewFields',
  viewFieldGroup: 'viewFieldGroups',
  viewGroup: 'viewGroups',
  viewSort: 'viewSorts',
  viewFilter: 'viewFilters',
  viewFilterGroup: 'viewFilterGroups',
  rowLevelPermissionPredicate: 'rowLevelPermissionPredicates',
  rowLevelPermissionPredicateGroup: 'rowLevelPermissionPredicateGroups',
  logicFunction: 'logicFunctions',
  role: 'roles',
  roleTarget: 'roleTargets',
  agent: 'agents',
  skill: 'skills',
  pageLayout: 'pageLayouts',
  pageLayoutWidget: 'pageLayoutWidgets',
  pageLayoutTab: 'pageLayoutTabs',
  commandMenuItem: 'commandMenuItems',
  navigationMenuItem: 'navigationMenuItems',
  frontComponent: 'frontComponents',
  webhook: 'webhooks',
};

export const mapAllMetadataNameToEntityKey = (
  metadataName: string,
): MetadataEntityKey | undefined => METADATA_NAME_TO_ENTITY_KEY[metadataName];
