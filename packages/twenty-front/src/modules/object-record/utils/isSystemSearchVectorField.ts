import { SEARCH_VECTOR_FIELD_NAME } from '@/views/constants/ViewFieldConstants';

export const isSystemSearchVectorField = (fieldName: string): boolean => {
  return fieldName === SEARCH_VECTOR_FIELD_NAME;
};
