import { Tag } from '@/ui/display/tag/components/Tag';

import { useSelectField } from '../../hooks/useSelectField';

export const SelectFieldDisplay = () => {
  const { fieldValue } = useSelectField();

  return <Tag color={fieldValue.color} text={fieldValue.label} />;
};
