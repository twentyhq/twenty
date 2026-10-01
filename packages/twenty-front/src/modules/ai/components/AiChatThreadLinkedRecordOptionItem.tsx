import { Dropdown } from 'twenty-ui/components';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { type FieldWidgetRelationRecord } from '@/page-layout/widgets/field/types/FieldWidgetRelationRecord';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type AiChatThreadLinkedRecordOptionItemProps = FieldWidgetRelationRecord & {
  onUnlink: () => void;
};

export const AiChatThreadLinkedRecordOptionItem = ({
  record,
  objectNameSingular,
  onUnlink,
}: AiChatThreadLinkedRecordOptionItemProps) => {
  const { recordChipData } = useRecordChipData({ objectNameSingular, record });

  return (
    <Dropdown.OptionItem
      selected
      indicator="checkbox"
      startIcon={
        <Avatar
          name={recordChipData.name}
          colorSeed={record.id}
          src={getAbsoluteImageUrl(recordChipData.avatarUrl ?? undefined)}
          shape={recordChipData.avatarShape}
          size="sm"
        />
      }
      onSelect={onUnlink}
    >
      {recordChipData.name}
    </Dropdown.OptionItem>
  );
};
