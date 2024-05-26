import { RawJSONScalar } from './raw-json.scalar';
import { PositionScalarType } from './position.scalar';
import { CursorScalarType } from './cursor.scalar';
import { BigFloatScalarType } from './big-float.scalar';
import { BigIntScalarType } from './big-int.scalar';
import { DateScalarType } from './date.scalar';
import { DateTimeScalarType } from './date-time.scalar';
import { TimeScalarType } from './time.scalar';
import { UUIDScalarType } from './uuid.scalar';

export * from './big-float.scalar';
export * from './big-int.scalar';
export * from './cursor.scalar';
export * from './date.scalar';
export * from './date-time.scalar';
export * from './time.scalar';
export * from './uuid.scalar';

export const scalars = [
  BigFloatScalarType,
  BigIntScalarType,
  DateScalarType,
  DateTimeScalarType,
  TimeScalarType,
  UUIDScalarType,
  CursorScalarType,
  PositionScalarType,
  RawJSONScalar,
];
