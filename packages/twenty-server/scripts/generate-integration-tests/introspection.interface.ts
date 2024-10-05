export interface IntrospectionResponse {
  data: {
    __schema: Schema;
  };
}

export interface Schema {
  queryType: { name: string };
  mutationType: { name: string | null };
  subscriptionType: { name: string | null };
  types: GraphQLType[];
  directives: Directive[];
}

export interface Directive {
  name: string;
  description: string | null;
  locations: string[];
  args: InputValue[];
}

export interface GraphQLType {
  kind: string;
  name: string;
  description: string | null;
  fields?: Field[];
  inputFields?: InputValue[];
  interfaces?: TypeRef[];
  enumValues?: EnumValue[];
  possibleTypes?: TypeRef[];
}

export interface Field {
  name: string;
  description: string | null;
  args: InputValue[];
  type: TypeRef;
  isDeprecated: boolean;
  deprecationReason: string | null;
}

export interface InputValue {
  name: string;
  description: string | null;
  type: TypeRef;
  defaultValue: string | null;
}

export interface TypeRef {
  kind: string;
  name: string | null;
  ofType: TypeRef | null;
}

export interface EnumValue {
  name: string;
  description: string | null;
  isDeprecated: boolean;
  deprecationReason: string | null;
}
