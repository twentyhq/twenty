import type { JsonLogicObject } from './json-logic-object';
import type { JsonLogicPrimitive } from './json-logic-primitive';

export type JsonLogicRule =
  | JsonLogicPrimitive
  | JsonLogicObject
  | JsonLogicRule[];
