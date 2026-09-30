import { isDefined } from 'twenty-shared/utils';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { SidePanelShareRecordContent } from '@/side-panel/pages/share-record/components/SidePanelShareRecordContent';
import { shareRecordTargetComponentState } from '@/side-panel/pages/share-record/states/shareRecordTargetComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type RecordSharingTargetInput } from '~/generated-metadata/graphql';

const SidePanelShareRecordPageContent = ({
  target,
}: {
  target: RecordSharingTargetInput;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: target.objectMetadataId,
  });
  const sharingState = useRecordSharing({ recordTarget: target, isOpen: true });

  return (
    <>
      <RecordSharingRefreshEffect refetch={sharingState.refetch} />
      <SidePanelShareRecordContent
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
