import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { type ChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

const PROPOSED_FIELD_METADATA_ICON = 'IconTag';

type FieldMetadataChipProps = {
  displayName: string;
  target: ChatReferenceTarget;
  fieldMetadataItem?: FieldMetadataItem;
};

export const FieldMetadataChip = ({
  displayName,
  target,
  fieldMetadataItem,
}: FieldMetadataChipProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItem?.icon ?? PROPOSED_FIELD_METADATA_ICON);

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={target.to}
      onClick={target.onClick}
      leftComponent={
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      }
    />
  );
};
