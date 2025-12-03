import { STANDARD_OBJECTS } from 'src/engine/core-modules/application/constants/standard-object.constant';
import { AllStandardObjectName } from 'src/engine/core-modules/application/types/all-standard-object-name.type';

export type AllStandardObjectFieldName<T extends AllStandardObjectName> =
  keyof (typeof STANDARD_OBJECTS)[T]['fields'];
