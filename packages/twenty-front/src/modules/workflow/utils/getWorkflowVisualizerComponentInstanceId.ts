export const getWorkflowVisualizerComponentInstanceId = ({
  id,
  isInRightDrawer,
}: {
  id: string;
  isInRightDrawer: boolean;
}) => {
  return `${id}__${isInRightDrawer ? 'right-drawer' : 'show-page'}`;
};
