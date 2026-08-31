import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

type ViewLinkProps = {
  viewId: string;
  displayName: string;
};

export const ViewLink = ({ viewId, displayName }: ViewLinkProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { objectMetadataItem, view, to, onClick } = useChatReferenceTarget({
    kind: 'view',
    viewId,
  });

  if (!isDefined(view) || !isDefined(objectMetadataItem)) {
    return <span>{displayName}</span>;
  }

  const Icon = getIcon(view.icon);

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={to}
      onClick={onClick}
      leftComponent={
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      }
    />
  );
};
