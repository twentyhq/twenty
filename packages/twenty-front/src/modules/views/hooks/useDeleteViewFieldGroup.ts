import { usePerformViewFieldGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFieldGroupAPIPersist';

export const useDeleteViewFieldGroup = () => {
  const { performViewFieldGroupAPIDelete } =
    usePerformViewFieldGroupAPIPersist();

  const deleteViewFieldGroup = async (viewFieldGroupId: string) => {
    return performViewFieldGroupAPIDelete([
      { input: { id: viewFieldGroupId } },
    ]);
  };

  return { deleteViewFieldGroup };
};
