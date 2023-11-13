import { Tag } from '@/ui/display/tag/components/Tag';

import { useEnumField } from '../../hooks/useEnumField';

export const EnumFieldDisplay = () => {
  const { fieldValue } = useEnumField();

  return <Tag color={fieldValue.color} text={fieldValue.text} />;
};
