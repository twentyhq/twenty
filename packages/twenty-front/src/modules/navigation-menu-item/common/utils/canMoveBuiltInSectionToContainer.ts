export const canMoveBuiltInSectionToContainer = ({
  builtInSectionKey,
  containerId,
}: {
  builtInSectionKey: string;
  containerId: string | null;
}) => !(builtInSectionKey === 'favorites' && containerId === null);
