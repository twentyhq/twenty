import { isDefined } from 'twenty-shared/utils';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { RecordSharingPermissionsEffect } from '@/object-record/record-sharing/components/RecordSharingPermissionsEffect';
import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { SidePanelShareRecordContent } from '@/side-panel/pages/share-record/components/SidePanelShareRecordContent';
import { shareRecordTargetComponentState } from '@/side-panel/pages/share-record/states/shareRecordTargetComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type RecordTargetInput } from '~/generated-metadata/graphql';

const SidePanelShareRecordPageContent = ({
  target,
}: {
  target: RecordTargetInput;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: target.objectMetadataId,
  });
  const sharingState = useRecordSharing({ recordTarget: target });

  return (
    <>
      <RecordSharingPermissionsEffect
        recordTarget={target}
        permissions={sharingState.sharing?.permissions}
      />
      <RecordSharingRefreshEffect refetch={sharingState.refetch} />
      <SidePanelShareRecordContent
        objectLabelPlural={objectMetadataItem.labelPlural}
        sharingReach={objectMetadataItem.sharingReach}
        recordUrl={
          new URL(
            getLinkToShowPage(objectMetadataItem.nameSingular, {
              id: target.recordId,
            }),
            window.location.origin,
          ).href
        }
        sharingState={sharingState}
      />
    </>
  );
};

export const SidePanelShareRecordPage = () => {
  const shareRecordTarget = useAtomComponentStateValue(
    shareRecordTargetComponentState,
  );

  if (!isDefined(shareRecordTarget)) {
    return null;
  }

  return <SidePanelShareRecordPageContent target={shareRecordTarget} />;
};
