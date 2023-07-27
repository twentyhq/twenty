export type EntityUpdateFieldHook = () => <T>(
  entityId: string,
  fieldName: string,
  value: T,
) => void | Promise<void>;
