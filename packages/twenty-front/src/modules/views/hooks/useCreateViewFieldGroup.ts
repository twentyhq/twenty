import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';

type CreateViewFieldGroupInput = {
  id: string;
  name: string;
  position: number;
  isVisible: boolean;
  viewId: string;
};

export const useCreateViewFieldGroup = () => {
  const { performViewFieldGroupAPICreate } =
    usePerformViewFieldGroupAPIPersist();

  const createViewFieldGroup = async (input: CreateViewFieldGroupInput) => {
    return performViewFieldGroupAPICreate({
      inputs: [input],
    });
  };

  return { createViewFieldGroup };
};
