import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import React from 'react';
import { useIcons } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import type { ExportObjectItem } from '../types/exportObjectItem';
import { ObjectTypeTag } from './ObjectTypeTag';
import {
  StyledObjectExportTableRow,
  StyledObjectNameLabel,
  StyledObjectNameTableCell,
  StyledSelectAllRow,
  StyledSelectTableCell,
} from './SettingsExport.styles';

export const ObjectSelectionTable = ({
  items,
  title,
  selectedObjects,
  onSelectObject,
  onSelectAll,
  allSelected,
  someSelected,
}: {
  items: ExportObjectItem[];
  title: string;
  selectedObjects: Set<string>;
  onSelectObject: (
    objectId: string,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  allSelected: boolean;
  someSelected: boolean;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const titleLowerCase = title.toLowerCase();

  if (!isNonEmptyArray(items)) return null;

  return (
    <TableSection title={title}>
      <StyledSelectAllRow>
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={onSelectAll}
        />
        <span>{t`Select all ${titleLowerCase}`}</span>
      </StyledSelectAllRow>
      {items.map((item) => {
        const Icon = getIcon(item.icon);
        return (
          <StyledObjectExportTableRow key={item.id}>
            <StyledSelectTableCell>
              <Checkbox
                checked={selectedObjects.has(item.id)}
                onChange={onSelectObject(item.id)}
              />
            </StyledSelectTableCell>
            <StyledObjectNameTableCell>
              {Icon !== null && (
                <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              )}
              <StyledObjectNameLabel title={item.labelPlural}>
                {item.labelPlural}
              </StyledObjectNameLabel>
            </StyledObjectNameTableCell>
            <TableCell>
              <ObjectTypeTag objectTypeLabel={item.objectTypeLabel} />
            </TableCell>
            <TableCell align="center">{item.fieldsCount}</TableCell>
          </StyledObjectExportTableRow>
        );
      })}
    </TableSection>
  );
};
