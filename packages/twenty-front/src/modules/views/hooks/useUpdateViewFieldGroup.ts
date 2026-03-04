import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';

type UpdateViewFieldGroupInput = {
  id: string;
  name?: string;
  position?: number;
  isVisible?: boolean;
};

export const useUpdateViewFieldGroup = () => {
  const { performViewFieldGroupAPIUpdate } =
    usePerformViewFieldGroupAPIPersist();

  const updateViewFieldGroup = async ({
    id,
    name,
    position,
    isVisible,
  }: UpdateViewFieldGroupInput) => {
    return performViewFieldGroupAPIUpdate([
      {
        input: {
          id,
          update: {
            name,
            position,
            isVisible,
          },
        },
      },
    ]);
  };

  return { updateViewFieldGroup };
};
