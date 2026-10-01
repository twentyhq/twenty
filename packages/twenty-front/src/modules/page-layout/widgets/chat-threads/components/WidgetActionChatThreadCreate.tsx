import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';

import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const WidgetActionChatThreadCreate = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );
  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    { recordId: targetRecord.id, allowRequestsToTwentyIcons },
  );
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();

  if (!hasAiPermission) {
    return null;
  }

  // The mention files the new conversation under the record on first send, unless removed before sending.
  const handleClick = () =>
    openAskAiPageWithPreprompt({
      serializedDocument: serializeMentionTagAsAdvancedTextEditorDocument({
        objectNameSingular: objectMetadataItem.nameSingular,
        recordId: targetRecord.id,
        label: recordIdentifier?.name ?? objectMetadataItem.labelSingular,
        imageUrl: recordIdentifier?.avatarUrl,
        isConversationTarget: true,
      }),
    });

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={t`New conversation`}
      onClick={handleClick}
    />
  );
};
