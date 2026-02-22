import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';

type CreateViewFieldGroupInput = {
  id: string;
  name: string;
  position: number;
  isVisible: boolean;
  viewId: string;
};

export const useCreateManyViewFieldGroups = () => {
  const { performViewFieldGroupAPICreate } =
    usePerformViewFieldGroupAPIPersist();

  const createManyViewFieldGroups = async (
    inputs: CreateViewFieldGroupInput[],
  ) => {
    return performViewFieldGroupAPICreate({ inputs });
  };

  return { createManyViewFieldGroups };
};
