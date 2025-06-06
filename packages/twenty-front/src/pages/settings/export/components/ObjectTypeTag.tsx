import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { Tag } from 'twenty-ui/components';

export const ObjectTypeTag = ({
  objectTypeLabel,
}: {
  objectTypeLabel: ReturnType<typeof getObjectTypeLabel>;
}) => {
  return (
    <Tag
      color={objectTypeLabel.labelColor}
      text={objectTypeLabel.labelText}
      weight="medium"
    />
  );
};