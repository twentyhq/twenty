import { CommandMenuItemOptionsDropdown } from '@/command-menu-item/edit/components/CommandMenuItemOptionsDropdown';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconDotsVertical, IconPin, IconPinnedOff } from 'twenty-ui/icon';
import { ButtonGroup } from 'twenty-ui/primitives/input';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type CommandMenuItemRowActionsProps = Pick<
  CommandMenuItemFieldsFragment,
  'shortLabel' | 'isPinned'
> & {
  itemId: string;
  serverShortLabel: string | null;
  onTogglePin: () => void;
};

export const CommandMenuItemRowActions = ({
  itemId,
  shortLabel,
  isPinned,
  serverShortLabel,
  onTogglePin,
}: CommandMenuItemRowActionsProps) => {
  const { t } = useLingui();

  return (
    <ButtonGroup attached={false} aria-label={t`Menu item actions`}>
      <CommandMenuItemOptionsDropdown
        itemId={itemId}
        isPinned={isPinned}
        shortLabel={shortLabel}
        serverShortLabel={serverShortLabel}
        iconButton={
          <LightIconButton aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <LightIconButton
        aria-label={isPinned ? t`Unpin` : t`Pin`}
        onClick={(event) => {
          event.stopPropagation();
          onTogglePin();
        }}
      >
        {isPinned ? <IconPinnedOff /> : <IconPin />}
      </LightIconButton>
    </ButtonGroup>
  );
};
