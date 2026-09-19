import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, useIcons } from 'twenty-ui/icon';

import { getInboxItemIconName } from '@/inbox/utils/getInboxItemIconName';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type InboxItem } from '~/generated/graphql';

export const useInboxItemIcon = (
  inboxItem: Pick<
    InboxItem,
    | 'icon'
    | 'threadId'
    | 'subjectObjectMetadataId'
    | 'subjectRecordId'
    | 'context'
    | 'toolCalls'
  >,
): IconComponent => {
  const { getIcon } = useIcons();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const subjectObjectIcon = isDefined(inboxItem.subjectObjectMetadataId)
    ? objectMetadataItemsByIdMap.get(inboxItem.subjectObjectMetadataId)?.icon
    : undefined;

  return getIcon(getInboxItemIconName({ inboxItem, subjectObjectIcon }));
};
