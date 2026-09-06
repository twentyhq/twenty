import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useDuplicateMessageList } from '@/command-menu-item/engine-command/record/single-record/message-list/hooks/useDuplicateMessageList';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const DuplicateMessageListSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const { duplicateMessageList } = useDuplicateMessageList();
  const navigate = useNavigateApp();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { t } = useLingui();

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to duplicate list');
  }

  const handleExecute = async () => {
    const result = await duplicateMessageList(recordId);

    if (isDefined(result) && isNonEmptyString(result.id)) {
      const memberCountLabel = plural(result.memberCount, {
        one: '# member',
        other: '# members',
      });

      enqueueSuccessSnackBar({
        message: t`List duplicated with ${memberCountLabel}`,
      });

      navigate(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.MessageList,
        objectRecordId: result.id,
      });
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
