import { type CompositeFieldGroupByDefinition } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/types/composite-field-group-by-definition.type';
import { type DateFieldGroupByDefinition } from 'src/engine/api/common/common-args-processors/group-by-arg-processor/types/date-field-group-by-definition.type';

export type FieldGroupByDefinition =
  | boolean
  | CompositeFieldGroupByDefinition
  | DateFieldGroupByDefinition
  | undefined;
