import { useRegisteredActions } from '@/action-menu/hooks/useRegisteredActions';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import {
  Command,
  CommandScope,
  CommandType,
} from '@/command-menu/types/Command';
import { i18n } from '@lingui/core';

export const useCommandMenuCommands = () => {
  const actionMenuEntries = useRegisteredActions();

  const navigateCommands = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Navigation,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      type: CommandType.Navigate,
      scope: CommandScope.Global,
      hotKeys: actionMenuEntry.hotKeys,
    })) as Command[];

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
      type: CommandType.Fallback,
      scope: CommandScope.Global,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  return {
    navigateCommands,
    actionRecordSelectionCommands,
    actionGlobalCommands,
    actionObjectCommands,
    workflowRunRecordSelectionCommands,
    workflowRunGlobalCommands,
    fallbackCommands,
  };
};
