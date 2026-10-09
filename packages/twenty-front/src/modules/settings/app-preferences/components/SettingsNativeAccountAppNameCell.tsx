import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsNativeAccountAppNameCellProps = {
  item: NativeAccountApp;
};

export const SettingsNativeAccountAppNameCell = ({
  item,
}: SettingsNativeAccountAppNameCellProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <UndecoratedLink
      to={getSettingsPath(SettingsPath.NativeAccountApp, {
        nativeAccountAppId: item.id,
      })}
      onClick={(event) => event.stopPropagation()}
    >
      <StyledNameCell>
        <item.Icon size={theme.icon.size.md} />
        {t(item.name)}
      </StyledNameCell>
    </UndecoratedLink>
  );
};
