import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';

import { useOpenNewAiChatWithRecord } from '@/ai/hooks/useOpenNewAiChatWithRecord';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const WidgetActionChatThreadCreate = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { openNewAiChatWithRecord } = useOpenNewAiChatWithRecord();

  if (!hasAiPermission) {
    return null;
  }

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={t`New conversation`}
      onClick={() =>
        openNewAiChatWithRecord({
          objectNameSingular: targetRecord.targetObjectNameSingular,
          recordId: targetRecord.id,
        })
      }
    />
  );
};
