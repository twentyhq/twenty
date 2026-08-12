import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenComposeEmailToRelatedPeoplePickerInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailToRelatedPeoplePickerInSidePanel';

// Reached from the command menu list, where there is no anchor for a dropdown.
// The pinned button and the record index dropdown pick the relation inline
// instead, in CommandMenuItemRenderer.
export const ComposeEmailToRelatedPeopleCommand = () => {
  const { contextStoreInstanceId } = useHeadlessCommandContextApi();

  const { openComposeEmailToRelatedPeoplePickerInSidePanel } =
    useOpenComposeEmailToRelatedPeoplePickerInSidePanel();

  const handleExecute = () => {
    openComposeEmailToRelatedPeoplePickerInSidePanel({
      contextStoreInstanceId,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
