import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const WidgetActionChatThreadCreate = () => {
  const { t } = useLingui();
  const store = useStore();
  const targetRecord = useTargetRecord();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );
  const { openAskAiPageWithPreprompt } = useOpenAskAiPageWithPreprompt();

  if (!hasAiPermission) {
    return null;
  }

  const handleClick = () => {
    const record = store.get(
      recordStoreFamilyState.atomFamily(targetRecord.id),
    );
    const recordIdentifier = isDefined(record)
      ? getObjectRecordIdentifier({
          objectMetadataItem,
          record,
          allowRequestsToTwentyIcons,
        })
      : undefined;
    const pendingRecordTarget = {
      objectNameSingular: objectMetadataItem.nameSingular,
      recordId: targetRecord.id,
    };

    openAskAiPageWithPreprompt({
      draft: {
        serializedDocument: serializeMentionTagAsAdvancedTextEditorDocument({
          ...pendingRecordTarget,
          label: recordIdentifier?.name ?? objectMetadataItem.labelSingular,
          imageUrl: recordIdentifier?.avatarUrl,
        }),
        pendingRecordTarget,
      },
    });
  };

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={t`New conversation`}
      onClick={handleClick}
    />
  );
};
