import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { flatObjectMetadataItemsSelector } from '@/object-metadata/states/flatObjectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { AppPath } from 'twenty-shared/types';
import { findById, getAppPath, isDefined } from 'twenty-shared/utils';
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
  const flatObjectMetadataItems = useAtomStateValue(
    flatObjectMetadataItemsSelector,
  );

  const objectMetadataItem = isDefined(view)
    ? flatObjectMetadataItems.find(findById(view.objectMetadataId))
    : undefined;

  // A view id can only come from a tool, so an unresolvable one is a
  // hallucination and must not be dressed up as a chip.
  if (!isDefined(view) || !isDefined(objectMetadataItem)) {
    return <span>{displayName}</span>;
  }

  const Icon = getIcon(view.icon);

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: objectMetadataItem.namePlural },
        { viewId },
      )}
      leftComponent={
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      }
    />
  );
};
