import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_AVAILABLE_OBJECTS = gql`
  query GetAvailableObjects {
    objects: getObjectMetadata {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
      icon
      isCustom
      isActive
      isSystem
    }
  }
`;

interface ObjectMetadata {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  isCustom: boolean;
  isActive: boolean;
  isSystem: boolean;
}

interface ObjectOption {
  value: string;
  label: string;
}

export const useAvailableObjects = () => {
  const { data, loading, error } = useQuery(GET_AVAILABLE_OBJECTS);

  const formatObjectsAsOptions = (objects: ObjectMetadata[]): ObjectOption[] => {
    return objects
      .filter((object) => object.isActive && !object.isSystem)
      .map((object) => ({
        value: object.id,
        label: object.labelSingular || object.nameSingular,
      }));
  };

  return {
    objects: data?.objects || [],
    objectOptions: data?.objects ? formatObjectsAsOptions(data.objects) : [],
    loading,
    error,
  };
};
