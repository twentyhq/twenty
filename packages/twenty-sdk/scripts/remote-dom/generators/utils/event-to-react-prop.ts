export const eventToReactProp = (eventName: string): string => {
  return `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
};
