import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AppChip } from '@/applications/components/AppChip';
import { TextInput } from '@/ui/input/components/TextInput';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

export const TRANSLATION_ROW_GRID_TEMPLATE =
  'minmax(0, 1fr) minmax(0, 1.4fr) 160px';

type SettingsObjectTranslationsRowProps = {
  source: string;
  placeholder: string;
  value: string;
  applicationId: string;
  usageCount: number;
  showApplication: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
};

const StyledSource = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SettingsObjectTranslationsRow = ({
  source,
  placeholder,
  value,
  applicationId,
  usageCount,
  showApplication,
  disabled,
  onChange,
  onBlur,
}: SettingsObjectTranslationsRowProps) => (
  <TableRow gridTemplateColumns={TRANSLATION_ROW_GRID_TEMPLATE} height="auto">
    <TableCell height="auto" color={themeCssVariables.font.color.primary}>
      <StyledSource title={source}>{source}</StyledSource>
    </TableCell>
    <TableCell
      height="auto"
      padding={`${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}`}
    >
      <TextInput
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        fullWidth
      />
    </TableCell>
    {showApplication ? (
      <TableCell height="auto">
        <AppChip applicationId={applicationId} />
      </TableCell>
    ) : (
      <TableCell height="auto" align="right">
        {usageCount}
      </TableCell>
    )}
  </TableRow>
);
