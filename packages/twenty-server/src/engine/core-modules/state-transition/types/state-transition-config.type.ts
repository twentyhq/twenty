export type FieldCondition =
  | { type: 'nonEmpty' }
  | { type: 'oneOf'; values: string[] }
  | { type: 'notOneOf'; values: string[] }
  | { type: 'minValue'; value: number }
  | { type: 'relatedRecordExists'; via: string };

export type TransitionRule = {
  toStages: string[];
  fromStages?: string[]; // omit = apply from any stage
  fields: Array<{
    name: string;
    condition: FieldCondition;
    message?: string; // user-facing override; default generated if omitted
  }>;
};

export type StateTransitionConfig = {
  objectName: string;
  stageFieldName: string;
  rules: TransitionRule[];
};
