import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useOpenCopilotRightDrawer } from '@/activities/copilot/right-drawer/hooks/useOpenCopilotRightDrawer';
import { copilotQueryState } from '@/activities/copilot/right-drawer/states/copilotQueryState';
import { COMMAND_MENU_NAVIGATE_COMMANDS } from '@/command-menu/constants/CommandMenuNavigateCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import {
  Command,
  CommandScope,
  CommandType,
} from '@/command-menu/types/Command';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { i18n } from '@lingui/core';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconSparkles } from 'twenty-ui';
import { useDebounce } from 'use-debounce';
import { FeatureFlagKey } from '~/generated/graphql';

export const useCommandMenuCommands = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);
  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300); // 200ms - 500ms

  const isCopilotEnabled = useIsFeatureEnabled(FeatureFlagKey.IsCopilotEnabled);
  const setCopilotQuery = useSetRecoilState(copilotQueryState);
  const openCopilotRightDrawer = useOpenCopilotRightDrawer();

  const copilotCommand: Command = {
    id: 'copilot',
    to: '', // TODO
    Icon: IconSparkles,
    label: 'Open Copilot',
    type: CommandType.Navigate,
    onCommandClick: () => {
      setCopilotQuery(deferredCommandMenuSearch);
      openCopilotRightDrawer();
    },
  };

  const copilotCommands: Command[] = isCopilotEnabled ? [copilotCommand] : [];

  const navigateCommands = Object.values(COMMAND_MENU_NAVIGATE_COMMANDS);

  const actionRecordSelectionCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard &&
        actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope: CommandScope.RecordSelection,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const actionObjectCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard &&
        actionMenuEntry.scope === ActionMenuEntryScope.Object,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope: CommandScope.Object,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const actionGlobalCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard &&
        actionMenuEntry.scope === ActionMenuEntryScope.Global,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope: CommandScope.Global,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const workflowRunRecordSelectionCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.WorkflowRun &&
        actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.WorkflowRun,
      scope: CommandScope.RecordSelection,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const workflowRunGlobalCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.WorkflowRun &&
        actionMenuEntry.scope === ActionMenuEntryScope.Global,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.WorkflowRun,
      scope: CommandScope.Global,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const fallbackCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Fallback,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.Fallback,
      scope: CommandScope.Global,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  return {
    copilotCommands,
    navigateCommands,
    actionRecordSelectionCommands,
    actionGlobalCommands,
    actionObjectCommands,
    workflowRunRecordSelectionCommands,
    workflowRunGlobalCommands,
    fallbackCommands,
  };
};
