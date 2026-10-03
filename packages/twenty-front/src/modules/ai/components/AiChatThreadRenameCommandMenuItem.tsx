import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconPencil } from 'twenty-ui/icon';

import { aiChatThreadIdBeingRenamedComponentState } from '@/ai/states/aiChatThreadIdBeingRenamedComponentState';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const AiChatThreadRenameCommandMenuItem = () => {
  const { t } = useLingui();
  const { commandMenuContextApi } = useContext(CommandMenuContext);

  const setAiChatThreadIdBeingRenamed = useSetAtomComponentState(
    aiChatThreadIdBeingRenamedComponentState,
  );

  const { selectedRecords, objectPermissions } = commandMenuContextApi;
  const [thread] = selectedRecords;

  const canRename =
    selectedRecords.length === 1 &&
    !isDefined(thread.deletedAt) &&
    objectPermissions.canUpdateObjectRecords &&
    thread.recordPermissions?.canUpdate !== false;

  if (!canRename) {
    return null;
  }

  return (
    <Dropdown.ActionItem
      startIcon={<IconPencil />}
      onClick={() => setAiChatThreadIdBeingRenamed(thread.id)}
    >
      {t`Rename`}
    </Dropdown.ActionItem>
  );
};
