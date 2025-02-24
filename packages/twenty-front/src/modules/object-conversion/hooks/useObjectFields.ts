import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_OBJECT_FIELDS = gql`
  query GetObjectFields($objectMetadataId: String!) {
    fields: getObjectMetadataFields(objectMetadataId: $objectMetadataId) {
      id
      name
      label
      type
      isCustom
      isNullable
      defaultValue
      description
    }
  }
`;

interface ObjectField {
  id: string;
  name: string;
  label: string;
  type: string;
  isCustom: boolean;
  isNullable: boolean;
  defaultValue?: any;
  description?: string;
}

interface FieldOption {
  value: string;
  label: string;
  type: string;
}

export const useObjectFields = (objectMetadataId?: string) => {
  const { data, loading, error } = useQuery(GET_OBJECT_FIELDS, {
    variables: { objectMetadataId },
    skip: !objectMetadataId,
  });

  const formatFieldsAsOptions = (fields: ObjectField[]): FieldOption[] => {
    return fields.map((field) => ({
      value: field.name,
      label: field.label || field.name,
      type: field.type,
    }));
  };

  return {
    fields: data?.fields || [],
    fieldOptions: data?.fields ? formatFieldsAsOptions(data.fields) : [],
    loading,
    error,
  };
};
