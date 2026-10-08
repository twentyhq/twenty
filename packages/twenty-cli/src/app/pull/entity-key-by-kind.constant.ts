import { type PullEntityKind } from '@/app/pull/build-pull-entities';
import { type ManifestEntityKey } from '@/app/source/extract-define-entity';

export const ENTITY_KEY_BY_KIND: Record<PullEntityKind, ManifestEntityKey> = {
  application: 'application',
  object: 'objects',
  field: 'fields',
  index: 'indexes',
  permissionFlag: 'permissionFlags',
  role: 'roles',
  view: 'views',
  viewField: 'viewFields',
  pageLayout: 'pageLayouts',
  pageLayoutTab: 'pageLayoutTabs',
  navigationMenuItem: 'navigationMenuItems',
  pageLayoutWidget: 'pageLayoutWidgets',
};
