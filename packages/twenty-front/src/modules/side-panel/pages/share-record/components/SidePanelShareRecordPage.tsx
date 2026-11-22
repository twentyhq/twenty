import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatThreadSharing } from '@/ai-chat/threads/hooks/useAiChatThreadSharing';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { RecordSharingPermissionsEffect } from '@/object-record/record-sharing/components/RecordSharingPermissionsEffect';
import { RecordSharingRefreshEffect } from '@/object-record/record-sharing/components/RecordSharingRefreshEffect';
import { useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { SidePanelShareRecordContent } from '@/side-panel/pages/share-record/components/SidePanelShareRecordContent';
import { shareRecordTargetComponentState } from '@/side-panel/pages/share-record/states/shareRecordTargetComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  type RecordTargetInput,
} from '~/generated-metadata/graphql';

const SidePanelShareRecordPageContent = ({
  target,
  sharingState,
}: {
  target: RecordTargetInput;
  sharingState: ReturnType<typeof useRecordSharing>;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: target.objectMetadataId,
  });

  return (
    <>
      <RecordSharingPermissionsEffect
        recordTarget={target}
        permissions={sharingState.sharing?.permissions}
      />
      <RecordSharingRefreshEffect refetch={sharingState.refetch} />
      <SidePanelShareRecordContent
        objectLabelPlural={objectMetadataItem.labelPlural}
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

const SidePanelShareRecordSharingContent = ({
  target,
}: {
  target: RecordTargetInput;
}) => {
  const sharingState = useRecordSharing({ recordTarget: target });

  return (
    <SidePanelShareRecordPageContent
      target={target}
      sharingState={sharingState}
    />
  );
};

const SidePanelShareRecordChatMembersContent = ({
  target,
}: {
  target: RecordTargetInput;
}) => {
  const sharingState = useAiChatThreadSharing({ recordTarget: target });

  return (
    <SidePanelShareRecordPageContent
      target={target}
      sharingState={sharingState}
    />
  );
};

const SidePanelShareRecordTargetContent = ({
  target,
}: {
  target: RecordTargetInput;
}) => {
  const isAgentChatRlsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_RLS_ENABLED,
  );
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: target.objectMetadataId,
  });

  return isAgentChatRlsEnabled &&
    objectMetadataItem.nameSingular ===
      StandardObjectNameSingular.AgentChatThread ? (
    <SidePanelShareRecordChatMembersContent target={target} />
  ) : (
    <SidePanelShareRecordSharingContent target={target} />
  );
};

export const SidePanelShareRecordPage = () => {
  const shareRecordTarget = useAtomComponentStateValue(
    shareRecordTargetComponentState,
  );

  if (!isDefined(shareRecordTarget)) {
    return null;
  }

  return <SidePanelShareRecordTargetContent target={shareRecordTarget} />;
};
