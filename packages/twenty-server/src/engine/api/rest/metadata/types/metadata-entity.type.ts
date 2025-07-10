export type Singular<S extends string> = S extends `${infer Stem}s` ? Stem : S;

export type ObjectName = 'fields' | 'objects';

export type ObjectNameSingularAndPlural<
  ObjectNameGeneric extends ObjectName = ObjectName,
> = {
  objectNameSingular: Singular<ObjectNameGeneric>;
  objectNamePlural: ObjectNameGeneric;
  id?: string;
};
