import { ViewFieldBooleanValue } from '../ViewField';

export const isViewFieldBooleanValue = (
  fieldValue: unknown,
): fieldValue is ViewFieldBooleanValue => typeof fieldValue === 'boolean';
