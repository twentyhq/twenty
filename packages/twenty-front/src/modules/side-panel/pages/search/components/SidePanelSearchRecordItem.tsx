import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { type SearchResultItem } from '@/side-panel/pages/search/types/SearchResultItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type Ref } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SidePanelSearchRecordItemProps = {
  item: SearchResultItem;
  anchorRef?: Ref<HTMLDivElement>;
};

export const SidePanelSearchRecordItem = ({
  item,
  anchorRef,
}: SidePanelSearchRecordItemProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { closeCommandMenu } = useCloseCommandMenu();
  const navigate = useNavigate();

  const isTaskOrNote = [
    StandardObjectNameSingular.Task,
    StandardObjectNameSingular.Note,
  ].includes(item.objectNameSingular as StandardObjectNameSingular);

  const handleClick = () => {
    if (isTaskOrNote) {
      openRecordInSidePanel({
        recordId: item.recordId,
        objectNameSingular:
          item.objectNameSingular as StandardObjectNameSingular,
      });
    } else {
      closeCommandMenu();
      navigate(
        getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: item.objectNameSingular,
          objectRecordId: item.recordId,
        }),
      );
    }
  };

  return (
    <SelectableListItem itemId={item.id} onEnter={handleClick}>
      <div ref={anchorRef}>
        <CommandMenuItem
          id={item.id}
          label={item.label}
          description={item.objectLabel}
          onClick={handleClick}
          LeftComponent={
            <Avatar
              shape={item.avatarShape}
              src={getAbsoluteImageUrl(item.imageUrl)}
              colorSeed={item.recordId}
              name={item.label}
            />
          }
        />
      </div>
    </SelectableListItem>
  );
};
