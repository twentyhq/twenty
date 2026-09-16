import { IconPicker } from '@/ui/input/components/IconPicker';
import { type ThemeColor } from 'twenty-ui/theme';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { ensureAbsoluteUrl, isValidUrl } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { TextInput } from '@/ui/input/components/TextInput';
import { type NewNavigationMenuItemInput } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { extractDomainFromUrl } from '@/navigation-menu-item/display/link/utils/extractDomainFromUrl';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

type NavigationMenuItemAddDropdownFormProps = {
  isFolder: boolean;
  onAdd: (input: NewNavigationMenuItemInput) => void;
};

export const NavigationMenuItemAddDropdownForm = ({
  isFolder,
  onAdd,
}: NavigationMenuItemAddDropdownFormProps) => {
  const { t } = useLingui();
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [icon, setIcon] = useState('IconFolder');
  const [color, setColor] = useState<ThemeColor>(
    DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER,
  );
  const [error, setError] = useState<string>();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isFolder) {
      if (!name.trim()) return;
      onAdd({
        type: NavigationMenuItemType.FOLDER,
        name: name.trim(),
        color,
        icon,
      });
      return;
    }
    const absoluteUrl = ensureAbsoluteUrl(link.trim());
    if (!isValidUrl(absoluteUrl)) {
      setError(t`Enter a valid URL`);
      return;
    }
    onAdd({
      type: NavigationMenuItemType.LINK,
      name: name.trim() || extractDomainFromUrl(absoluteUrl),
      link: absoluteUrl,
    });
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      {isFolder && (
        <IconPicker
          dropdownId="navigation-new-folder-icon"
          selectedIconKey={icon}
          onChange={({ iconKey }) => setIcon(iconKey)}
          iconColorPicker={{ selectedColor: color, onColorChange: setColor }}
        />
      )}

      <TextInput
        autoFocus
        fullWidth
        label={t`Name`}
        value={name}
        onChange={setName}
        placeholder={isFolder ? t`Folder name` : t`Link label`}
      />
      {!isFolder && (
        <TextInput
          fullWidth
          label={t`URL`}
          value={link}
          onChange={(value) => {
            setLink(value);
            setError(undefined);
          }}
          placeholder="https://example.com"
        />
      )}
      {error && <span role="alert">{error}</span>}
      <Button
        type="submit"
        title={t`Add menu item`}
        variant="primary"
        accent="blue"
        disabled={isFolder ? !name.trim() : !link.trim()}
      />
    </StyledForm>
  );
};
