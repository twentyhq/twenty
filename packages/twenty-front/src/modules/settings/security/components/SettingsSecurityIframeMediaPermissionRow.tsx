import { useLingui } from '@lingui/react/macro';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { IconButton } from 'twenty-ui/components/input';
import { IconCamera, IconMicrophone, IconVideo, IconX } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { SettingsSecurityOriginTableCell } from '@/settings/security/components/SettingsSecurityOriginTableCell';
import { IFRAME_MEDIA_PERMISSIONS_TABLE_GRID_AUTO_COLUMNS } from '@/settings/security/constants/IframeMediaPermissionsTableGridAutoColumns';
import { type IframeMediaAccess } from '@/settings/security/types/IframeMediaAccess';
import { getIframeMediaAccess } from '@/settings/security/utils/getIframeMediaAccess';
import { useSettingsSecurityIframeMediaPermissionsOrThrow } from '@/settings/security/contexts/SettingsSecurityIframeMediaPermissionsContext';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

type SettingsSecurityIframeMediaPermissionRowProps = {
  permission: IframeMediaPermission;
  disabled: boolean;
};

export const SettingsSecurityIframeMediaPermissionRow = ({
  permission,
  disabled,
}: SettingsSecurityIframeMediaPermissionRowProps) => {
  const { t } = useLingui();
  const { savePermission } = useSettingsSecurityIframeMediaPermissionsOrThrow();
  const { origin } = permission;

  const accessOptions: SelectOption<IframeMediaAccess>[] = [
    {
      value: 'microphoneAndCamera',
      label: t`Microphone and camera`,
      Icon: IconVideo,
    },
    { value: 'microphone', label: t`Microphone only`, Icon: IconMicrophone },
    { value: 'camera', label: t`Camera only`, Icon: IconCamera },
  ];

  return (
    <TableRow
      gridAutoColumns={IFRAME_MEDIA_PERMISSIONS_TABLE_GRID_AUTO_COLUMNS}
    >
      <SettingsSecurityOriginTableCell origin={origin} />
      <TableCell role="group" aria-label={t`Media access for ${origin}`}>
        <Select<IframeMediaAccess>
          dropdownId={`iframe-media-permission-access-${origin}`}
          value={getIframeMediaAccess(permission)}
          options={accessOptions}
          onChange={(access) =>
            void savePermission({
              origin,
              microphone: access !== 'camera',
              camera: access !== 'microphone',
            })
          }
          disabled={disabled}
          dropdownWidth={GenericDropdownContentWidth.Large}
          selectSizeVariant="small"
          withSearchInput={false}
          needIconCheck
          fullWidth
        />
      </TableCell>
      <TableCell align="right">
        <IconButton
          aria-label={t`Remove media access for ${origin}`}
          disabled={disabled}
          variant="ghost"
          size="sm"
          onClick={() =>
            void savePermission({ origin, microphone: false, camera: false })
          }
        >
          <IconX />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
