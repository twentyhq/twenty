import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordSharingDropdown } from '@/object-record/record-sharing/components/RecordSharingDropdown';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type AiChatSharingDropdownProps = { threadId: string };

export const AiChatSharingDropdown = ({
  threadId,
}: AiChatSharingDropdownProps) => {
  const { t } = useLingui();
  const isAiChatSharingDropdownEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED,
  );
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'agentChatThread',
  });

  if (!isAiChatSharingDropdownEnabled) {
    return null;
  }

  return (
    <RecordSharingDropdown
      target={{ objectMetadataId: objectMetadataItem.id, recordId: threadId }}
      title={t`Share conversation`}
      recordUrl={
        new URL(
          getAppPath(AppPath.AiChat, { threadId }),
          window.location.origin,
        ).href
      }
    />
  );
};
