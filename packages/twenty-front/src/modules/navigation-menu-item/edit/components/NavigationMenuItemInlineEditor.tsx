import { useState } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { ensureAbsoluteUrl, isValidUrl } from 'twenty-shared/utils';
import { IconChevronDown, useIcons } from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { DoubleTextInput } from '@/ui/field/input/components/DoubleTextInput';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FieldInputContainer } from '@/ui/field/input/components/FieldInputContainer';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';

const StyledIconPickerButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;
const StyledError = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

type NavigationMenuItemInlineEditorProps = {
  item: NavigationMenuItem;
  dropdownId: string;
  onClose: () => void;
};

export const NavigationMenuItemInlineEditor = ({
  item,
  dropdownId,
  onClose,
}: NavigationMenuItemInlineEditorProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { updateItem } = useNavigationMenuItemEditController();
  const [name, setName] = useState(item.name ?? '');
  const [error, setError] = useState(false);
  const [icon, setIcon] = useState(item.icon ?? FOLDER_ICON_DEFAULT);
  const [color, setColor] = useState<ThemeColor>(
    (item.color ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER) as ThemeColor,
  );
  const saveFolder = () => {
    if (!name.trim()) return;
    void updateItem(item.id, { name: name.trim(), icon, color });
    onClose();
  };
  if (item.type === NavigationMenuItemType.LINK) {
    const saveLink = ({
      firstValue,
      secondValue,
    }: {
      firstValue: string;
      secondValue: string;
    }) => {
      const link = ensureAbsoluteUrl(secondValue.trim());
      if (!isValidUrl(link)) {
        setError(true);
        return;
      }
      void updateItem(item.id, { name: firstValue.trim(), link });
      onClose();
    };
    return (
      <>
        <DoubleTextInput
          instanceId={dropdownId}
          firstValue={item.name ?? ''}
          secondValue={item.link ?? ''}
          firstValuePlaceholder={t`Link label`}
          secondValuePlaceholder={t`URL`}
          onEnter={saveLink}
          onEscape={onClose}
          onClickOutside={(_, value) => saveLink(value)}
          onChange={() => setError(false)}
        />
        {error && (
          <StyledError role="alert">{t`Enter a valid URL`}</StyledError>
        )}
      </>
    );
  }
  return (
    <FieldInputContainer>
      <IconPicker
        dropdownId={`${dropdownId}-icon`}
        selectedIconKey={icon}
        onChange={({ iconKey }) => {
          setIcon(iconKey);
          void updateItem(item.id, { icon: iconKey });
        }}
        iconColorPicker={{
          selectedColor: color,
          onColorChange: (nextColor) => {
            setColor(nextColor);
            void updateItem(item.id, { color: nextColor });
          },
        }}
        clickableComponent={
          <StyledIconPickerButton
            type="button"
            aria-label={t`Choose icon and color`}
          >
            <ColoredIcon Icon={getIcon(icon)} color={color} />
            <IconChevronDown size={themeCssVariables.icon.size.sm} />
          </StyledIconPickerButton>
        }
      />
      <StyledTextInput
        autoFocus
        aria-label={t`Folder name`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget))
            saveFolder();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            saveFolder();
          }
          if (event.key === 'Escape') onClose();
        }}
      />
    </FieldInputContainer>
  );
};
