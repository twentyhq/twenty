type ObjectOptions = {
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
};

export const Object = (_: ObjectOptions): ClassDecorator => {
  return (_) => {};
};
