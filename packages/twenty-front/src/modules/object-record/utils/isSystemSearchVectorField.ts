import { SEARCH_VECTOR_FIELD_NAME } from '@/object-record/constants/SearchVectorFieldName';

export const isSystemSearchVectorField = (fieldName: string): boolean => {
  return fieldName === SEARCH_VECTOR_FIELD_NAME;
};
