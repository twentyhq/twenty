import { styled } from '@linaria/react';
import { type KeyboardEvent, useState } from 'react';
import { Key } from 'ts-key-enum';
import { themeCssVariables } from 'twenty-ui/theme';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type NavigationMenuItemContainerNameEditorProps = {
  item: NavigationMenuItem;
  placeholder: string;
  defaultName?: string;
  hasIconPicker?: boolean;
  onSubmit: () => void;
};

export const NavigationMenuItemContainerNameEditor = ({
  item,
  placeholder,
  defaultName,
  hasIconPicker = false,
  onSubmit,
}: NavigationMenuItemContainerNameEditorProps) => {
  const { updateItem } = useNavigationMenuItemEditController('workspace');
  const [name, setName] = useState(item.name ?? defaultName ?? '');

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
      <StyledRow>
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
            if (value.trim() !== '') {
              void updateItem(item.id, { name: value.trim() });
            }
          }}
          onKeyDown={handleKeyDown}
        />
      </StyledRow>
    </DropdownMenuItemsContainer>
  );
};
