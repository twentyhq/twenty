import { type ToolRecordReference } from 'twenty-shared/ai';
import { Avatar } from 'twenty-ui/primitives/data-display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

type SidePanelAiChatToolCallRecordItemProps = {
  recordReference: ToolRecordReference;
};

export const SidePanelAiChatToolCallRecordItem = ({
  recordReference,
}: SidePanelAiChatToolCallRecordItemProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: recordReference.objectNameSingular,
      objectNameType: 'singular',
    },
  );

  const openRecord = () =>
    openRecordInSidePanel({
      recordId: recordReference.recordId,
      objectNameSingular: recordReference.objectNameSingular,
    });

  return (
    <SelectableListItem itemId={recordReference.recordId} onEnter={openRecord}>
      <CommandMenuItem
        id={recordReference.recordId}
        label={recordReference.displayName}
        onClick={openRecord}
        LeftComponent={
          <Avatar
            shape={getAvatarShape(objectMetadataItem ?? undefined)}
            colorSeed={recordReference.recordId}
            name={recordReference.displayName}
          />
        }
      />
    </SelectableListItem>
  );
};
