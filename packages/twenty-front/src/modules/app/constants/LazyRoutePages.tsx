import { lazy } from 'react';

// Shared by the main route tree and the side panel's hostable set, so a page
// hosted on the right resolves the same chunk the main outlet already loaded.
export const LazyRecordIndexPage = lazy(() =>
  import('~/pages/object-record/RecordIndexPage').then((module) => ({
    default: module.RecordIndexPage,
  })),
);

export const LazyRecordShowPage = lazy(() =>
  import('~/pages/object-record/RecordShowPage').then((module) => ({
    default: module.RecordShowPage,
  })),
);

export const LazySettingsObjectDetailPage = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjectDetailPage').then(
    (module) => ({
      default: module.SettingsObjectDetailPage,
    }),
  ),
);

export const LazySettingsObjectFieldEdit = lazy(() =>
  import('~/pages/settings/data-model/SettingsObjectFieldEdit').then(
    (module) => ({
      default: module.SettingsObjectFieldEdit,
    }),
  ),
);
