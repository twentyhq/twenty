export const getComponentStateStorageKey = ({
  componentStateKey,
  instanceId,
}: {
  componentStateKey: string;
  instanceId: string;
}): string => {
  return `${componentStateKey}__${instanceId}`;
};
