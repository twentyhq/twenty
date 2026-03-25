export const splitWorkflowTriggerEventName = (eventName: string) => {
  const [objectType, event] = eventName.split('.');

  return {
    objectType,
    event,
  };
};
