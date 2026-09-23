import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordSharingDropdown } from '@/object-record/record-sharing/components/RecordSharingDropdown';

type AiChatSharingDropdownProps = { threadId: string };

export const AiChatSharingDropdown = ({
  threadId,
}: AiChatSharingDropdownProps) => {
  const { t } = useLingui();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'agentChatThread',
  });
  return (
    <RecordSharingDropdown
      target={{ objectMetadataId: objectMetadataItem.id, recordId: threadId }}
      title={t`Share conversation`}
      description={t`Viewers can read this conversation and future messages. Editors can also send messages. People with full access can manage sharing. AI actions use the sender’s own permissions.`}
      recordUrl={
        new URL(
          getAppPath(AppPath.AiChat, { threadId }),
          window.location.origin,
        ).href
      }
    />
  );
};
