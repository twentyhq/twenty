import { isNonEmptyString } from '@sniptt/guards';
import { matchPath, parsePath } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isWidgetViewType,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type SidePanelArtifact } from '@/side-panel/artifacts/types/SidePanelArtifact';
import { type View } from '@/views/types/View';
import { ViewKey } from '~/generated-metadata/graphql';

export type ResolveSidePanelArtifactParams = {
  artifactPath: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: View[];
};

export const resolveSidePanelArtifact = ({
  artifactPath,
  objectMetadataItems,
  views,
}: ResolveSidePanelArtifactParams): SidePanelArtifact | null => {
  const parsedPath = parsePath(artifactPath);

  if (!isNonEmptyString(parsedPath.pathname)) {
    return null;
  }

  const recordMatch = matchPath(AppPath.RecordShowPage, parsedPath.pathname);

  if (isDefined(recordMatch)) {
    const { objectNameSingular, objectRecordId } = recordMatch.params;

    if (
      !isNonEmptyString(objectNameSingular) ||
      !isNonEmptyString(objectRecordId)
    ) {
      return null;
    }

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === objectNameSingular,
    );

    return isDefined(objectMetadataItem)
      ? {
          kind: 'record',
          artifactPath,
          objectMetadataItem,
          recordId: objectRecordId,
        }
      : null;
  }

  const recordIndexMatch = matchPath(
    AppPath.RecordIndexPage,
    parsedPath.pathname,
  );

  if (isDefined(recordIndexMatch)) {
    const { objectNamePlural } = recordIndexMatch.params;

    if (!isNonEmptyString(objectNamePlural)) {
      return null;
    }

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.namePlural === objectNamePlural,
    );

    if (!isDefined(objectMetadataItem)) {
      return null;
    }

    const objectViews = views
      .filter(
        (view) =>
          view.objectMetadataId === objectMetadataItem.id &&
          !isWidgetViewType(view.type),
      )
      .sort(
        (firstView, secondView) => firstView.position - secondView.position,
      );

    const requestedViewId = new URLSearchParams(parsedPath.search).get(
      'viewId',
    );

    const view = isNonEmptyString(requestedViewId)
      ? objectViews.find((item) => item.id === requestedViewId)
      : (objectViews.find((item) => item.key === ViewKey.INDEX) ??
        objectViews[0]);

    return isDefined(view)
      ? {
          kind: 'recordIndex',
          artifactPath,
          objectMetadataItem,
          view,
        }
      : null;
  }

  const settingsFieldMatch = matchPath(
    getSettingsPath(SettingsPath.ObjectFieldEdit),
    parsedPath.pathname,
  );

  if (isDefined(settingsFieldMatch)) {
    const { objectNamePlural, fieldName } = settingsFieldMatch.params;

    if (!isNonEmptyString(objectNamePlural) || !isNonEmptyString(fieldName)) {
      return null;
    }

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.namePlural === objectNamePlural,
    );
    const fieldMetadataItem = objectMetadataItem?.fields.find(
      (item) => item.name === fieldName,
    );

    return isDefined(objectMetadataItem) && isDefined(fieldMetadataItem)
      ? {
          kind: 'settingsField',
          artifactPath,
          objectMetadataItem,
          fieldMetadataItem,
        }
      : null;
  }

  return null;
};
