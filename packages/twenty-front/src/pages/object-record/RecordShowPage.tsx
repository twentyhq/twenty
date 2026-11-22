import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { findCoreObjectShowPage } from '@/object-core/utils/findCoreObjectShowPage';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import {
  type RecordShowPageParameters,
  RecordShowPageContent,
} from '@/object-record/record-show/components/RecordShowPageContent';

export const RecordShowPage = () => {
  const parameters = useParams<RecordShowPageParameters>();
  const workspaceSurface = useWorkspaceSurface();
  const { objectMetadataItems } = useObjectMetadataItems();

  const isInSidePanel = workspaceSurface.type === 'side-panel';
  const isRouteObjectMetadataAvailable =
    isDefined(parameters.objectNameSingular) &&
    objectMetadataItems.some(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === parameters.objectNameSingular,
    );

  if (isInSidePanel && !isRouteObjectMetadataAvailable) {
    return <WorkspaceRouteUnavailable />;
  }

  const CoreObjectShowPage = findCoreObjectShowPage(
    parameters.objectNameSingular,
  );

  if (isDefined(CoreObjectShowPage) && isDefined(parameters.objectRecordId)) {
    return <CoreObjectShowPage objectRecordId={parameters.objectRecordId} />;
  }

  return <RecordShowPageContent parameters={parameters} />;
};
