import { Dropdown } from 'twenty-ui/components/navigation';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useLingui } from '@lingui/react/macro';

export const MultiWorkspaceDropdownThemesComponents = () => {
  const { t } = useLingui();

  const { setColorScheme, colorScheme, colorSchemeList } = useColorScheme();

  return (
    <>
      <Dropdown.Back>{t`Theme`}</Dropdown.Back>
      <Dropdown.Section>
        {colorSchemeList.map((theme) => (
          <Dropdown.OptionItem
            key={theme.id}
            startIcon={<SelectOptionIcon Icon={theme.icon} />}
            onSelect={() => setColorScheme(theme.id)}
            closeOnSelect={false}
            selected={theme.id === colorScheme}
          >
            {theme.id === 'System'
              ? t`System`
              : theme.id === 'Dark'
                ? t`Dark`
                : t`Light`}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
