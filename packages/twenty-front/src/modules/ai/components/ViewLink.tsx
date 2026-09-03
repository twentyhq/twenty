import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

type ViewLinkProps = {
  viewId: string;
  displayName: string;
};

export const ViewLink = ({ viewId, displayName }: ViewLinkProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { view } = useViewById(viewId);
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const objectMetadataItem = isDefined(view)
    ? objectMetadataItemsByIdMap.get(view.objectMetadataId)
    : undefined;

  const path =
    isDefined(view) && isDefined(objectMetadataItem)
      ? getAppPath(
          AppPath.RecordIndexPage,
          { objectNamePlural: objectMetadataItem.namePlural },
          { viewId },
        )
      : undefined;

  const { to, onClick } = useChatReferenceTarget(path);

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
