export const createEventWithReadonlyProperties = <
  TProperties extends Record<string, unknown>,
>(
  type: string,
  properties: TProperties,
): Event & TProperties => {
  const event = new Event(type);

  for (const [propertyName, propertyValue] of Object.entries(properties)) {
    Object.defineProperty(event, propertyName, { value: propertyValue });
  }

  return event as Event & TProperties;
};
