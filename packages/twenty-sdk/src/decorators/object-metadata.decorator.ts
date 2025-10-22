type ObjectMetadataOptions = {
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
};

export const ObjectMetadata = (_: ObjectMetadataOptions): ClassDecorator => {
  return () => {};
};
