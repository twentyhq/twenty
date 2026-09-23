export const getEditLinkPopoverDropdownId = ({
  editorInstanceId,
  bubbleMenuType,
}: {
  editorInstanceId: string;
  bubbleMenuType: 'text' | 'link';
}) => `edit-link-popover-${bubbleMenuType}-${editorInstanceId}`;
