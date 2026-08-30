import { parsePath } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import {
  LazyRecordIndexPage,
  LazyRecordShowPage,
  LazySettingsObjectDetailPage,
  LazySettingsObjectFieldEdit,
} from '@/app/constants/LazyRoutePages';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { SidePanelHostedRecordIndexDataModelButton } from '@/side-panel/routing/components/SidePanelHostedRecordIndexDataModelButton';
import { type SidePanelHostableRoute } from '@/side-panel/routing/types/SidePanelHostableRoute';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';

export const SIDE_PANEL_HOSTABLE_ROUTES: SidePanelHostableRoute[] = [
  {
    path: getSettingsPath(SettingsPath.ObjectFieldEdit),
    element: <LazySettingsObjectFieldEdit />,
    settingsPermission: PermissionFlagType.DATA_MODEL,
    resolvePageInfo: ({ match, store }) => {
      const objectMetadataItem = store
        .get(objectMetadataItemsSelector.atom)
        .find((item) => item.namePlural === match.params.objectNamePlural);

      const fieldMetadataItem = objectMetadataItem?.fields.find(
        (item) => item.name === match.params.fieldName,
      );

      return {
        title: fieldMetadataItem?.label ?? '',
        iconKey: fieldMetadataItem?.icon,
      };
    },
  },
  {
    path: getSettingsPath(SettingsPath.ObjectDetail),
    element: <LazySettingsObjectDetailPage />,
    settingsPermission: PermissionFlagType.DATA_MODEL,
    resolvePageInfo: ({ match, store }) => {
      const objectMetadataItem = store
        .get(objectMetadataItemsSelector.atom)
        .find((item) => item.namePlural === match.params.objectNamePlural);

      if (!isDefined(objectMetadataItem)) {
        return { title: '' };
      }

      return {
        title: objectMetadataItem.labelPlural,
        iconKey: objectMetadataItem.icon,
        iconColor: getIconColorForObjectType(objectMetadataItem.nameSingular),
      };
    },
  },
  {
    path: AppPath.RecordIndexPage,
    element: <LazyRecordIndexPage />,
    TopBarRightCorner: SidePanelHostedRecordIndexDataModelButton,
    resolvePageInfo: ({ match, path, store }) => {
      const objectMetadataItem = store
        .get(objectMetadataItemsSelector.atom)
        .find((item) => item.namePlural === match.params.objectNamePlural);

      if (!isDefined(objectMetadataItem)) {
        return { title: '' };
      }

      const viewId = new URLSearchParams(parsePath(path).search).get('viewId');

      const view = isDefined(viewId)
        ? store.get(viewFromViewIdFamilySelector.selectorFamily({ viewId }))
        : undefined;

      return {
        title: view?.name ?? objectMetadataItem.labelPlural,
        iconKey: view?.icon ?? objectMetadataItem.icon,
        iconColor: getIconColorForObjectType(objectMetadataItem.nameSingular),
      };
    },
  },
  {
    path: AppPath.RecordShowPage,
    element: <LazyRecordShowPage />,
    resolvePageInfo: ({ match, store }) => {
      const objectMetadataItem = store
        .get(objectMetadataItemsSelector.atom)
        .find((item) => item.nameSingular === match.params.objectNameSingular);

      if (!isDefined(objectMetadataItem)) {
        return { title: '' };
      }

      return {
        title: objectMetadataItem.labelSingular,
        iconKey: objectMetadataItem.icon ?? 'IconList',
        iconColor: getIconColorForObjectType(objectMetadataItem.nameSingular),
      };
    },
  },
];
