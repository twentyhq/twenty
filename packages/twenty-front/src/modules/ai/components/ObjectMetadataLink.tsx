import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useTheme } from 'twenty-ui/theme-constants';

const PROPOSED_OBJECT_METADATA_ICON = 'IconListNumbers';

type ObjectMetadataLinkProps = {
  objectNameSingular: string;
  displayName: string;
};

export const ObjectMetadataLink = ({
  objectNameSingular,
  displayName,
}: ObjectMetadataLinkProps) => {
  const theme = useTheme();

  const { objectMetadataItem, to, onClick } = useChatReferenceTarget({
    kind: 'object',
    objectNameSingular,
  });

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={to}
      onClick={onClick}
      leftComponent={
        <ObjectMetadataIcon
          objectMetadataItem={
            objectMetadataItem ?? {
              icon: PROPOSED_OBJECT_METADATA_ICON,
              nameSingular: objectNameSingular,
              color: null,
              isSystem: false,
            }
          }
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      }
    />
  );
};
