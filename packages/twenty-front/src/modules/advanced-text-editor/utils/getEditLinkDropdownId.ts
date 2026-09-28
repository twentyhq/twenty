export const getEditLinkDropdownId = ({
  editorInstanceId,
  bubbleMenuType,
}: {
  editorInstanceId: string;
  bubbleMenuType: 'text' | 'link';
}) => `edit-link-dropdown-${bubbleMenuType}-${editorInstanceId}`;
