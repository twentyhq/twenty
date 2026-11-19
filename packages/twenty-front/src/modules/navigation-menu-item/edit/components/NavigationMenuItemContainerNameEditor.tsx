import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type KeyboardEvent, useState } from 'react';
import { Key } from 'ts-key-enum';
import { themeCssVariables } from 'twenty-ui/theme';

import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const StyledIconAndName = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type NavigationMenuItemContainerNameEditorProps = {
  item: Pick<NavigationMenuItem, 'id' | 'name' | 'icon'>;
  placeholder: string;
  hasIconPicker?: boolean;
  onSubmit: () => void;
};

export const NavigationMenuItemContainerNameEditor = ({
  item,
  placeholder,
  hasIconPicker = false,
  onSubmit,
}: NavigationMenuItemContainerNameEditorProps) => {
  const { updateItem } = useNavigationMenuItemEditController('workspace');
  const [initialName] = useState(item.name ?? '');
  const [name, setName] = useState(initialName);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key !== Key.Enter ||
      isKeyboardEventComposing(event.nativeEvent)
    ) {
      return;
    }

    event.preventDefault();
    onSubmit();
  };

  return (
    <DropdownMenuItemsContainer>
      <StyledIconAndName>
        {hasIconPicker && (
          <IconPicker
            size="sm"
            dropdownId={`navigation-menu-item-${item.id}-icon-picker`}
            selectedIconKey={item.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT}
            onChange={({ iconKey }) =>
              void updateItem(item.id, { icon: iconKey })
            }
          />
        )}
        <TextInput
          value={name}
          placeholder={placeholder}
          aria-label={placeholder}
          autoFocus
          onFocus={(event) => event.target.select()}
          autoGrow={false}
          sizeVariant="sm"
          fullWidth
          onChange={(value) => {
            setName(value);
            void updateItem(item.id, {
              name: isNonEmptyString(value.trim()) ? value.trim() : initialName,
            });
          }}
          onKeyDown={handleKeyDown}
        />
      </StyledIconAndName>
    </DropdownMenuItemsContainer>
  );
};
