import { useDropdownContent } from '@/ui/layout/dropdown/hooks/useDropdownContent';

type DropdownContentItemProps<Key extends string> = {
  id: Key;
  children: React.ReactNode;
};

export const DropdownContentItem = <Key extends string>({
  id,
  children,
}: DropdownContentItemProps<Key>) => {
  const { currentContentId } = useDropdownContent<Key>();

  if (currentContentId !== id) {
    return null;
  }

  return children;
};
