import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ComponentType, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  AppTooltip,
  IconArrowUpRight,
  IconInfoCircle,
  IllustrationIconArray,
  IllustrationIconJson,
  IllustrationIconNumbers,
  IllustrationIconText,
  IllustrationIconToggle,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SchemaProperty = {
  type?: string;
  description?: string;
  format?: string;
  items?: { type?: string };
};

export type SettingsToolParameterTableProps = {
  schemaProperties: Record<string, SchemaProperty>;
  requiredFields?: string[];
  functionLink?: string;
};

const PARAMETER_TABLE_GRID = '140px 1fr 80px 24px';

const TYPE_ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
  string: IllustrationIconText,
  number: IllustrationIconNumbers,
  integer: IllustrationIconNumbers,
  boolean: IllustrationIconToggle,
  array: IllustrationIconArray,
  object: IllustrationIconJson,
};

const StyledTableHeaderRow = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledFieldsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledInfoIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

const getDisplayType = (property: SchemaProperty): string => {
  if (property.format) {
    return property.format;
  }

  if (property.type === 'array' && property.items?.type) {
    return `${property.items.type}[]`;
  }

  return property.type ?? '';
};

export const SettingsToolParameterTable = ({
  schemaProperties,
  requiredFields,
  functionLink,
}: SettingsToolParameterTableProps) => {
  const { theme } = useContext(ThemeContext);
  const entries = Object.entries(schemaProperties);

  if (entries.length === 0 && !functionLink) {
    return (
      <SettingsEmptyPlaceholder>{t`No parameters`}</SettingsEmptyPlaceholder>
    );
  }

  return (
    <Table>
      {entries.length > 0 && (
        <>
          <StyledTableHeaderRow>
            <TableRow gridTemplateColumns={PARAMETER_TABLE_GRID}>
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Type`}</TableHeader>
              <TableHeader>{t`Required`}</TableHeader>
              <TableHeader />
            </TableRow>
          </StyledTableHeaderRow>
          <StyledFieldsContainer>
            {entries.map(([paramName, property], index) => {
              const infoIconId = `param-info-${index}`;
              const TypeIcon = TYPE_ICON_MAP[property.type ?? ''];

              return (
                <TableRow
                  key={paramName}
                  gridTemplateColumns={PARAMETER_TABLE_GRID}
                >
                  <TableCell
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    <OverflowingTextWithTooltip text={paramName} />
                  </TableCell>
                  <TableCell gap={themeCssVariables.spacing[1]}>
                    {isDefined(TypeIcon) && (
                      <TypeIcon size={theme.icon.size.md} />
                    )}
                    {getDisplayType(property)}
                  </TableCell>
                  <TableCell color={themeCssVariables.font.color.tertiary}>
                    {requiredFields?.includes(paramName) ? t`Yes` : ''}
                  </TableCell>
                  <TableCell>
                    {property.description && (
                      <StyledInfoIconContainer>
                        <IconInfoCircle
                          id={infoIconId}
                          size={theme.icon.size.md}
                          color={theme.font.color.tertiary}
                          style={{ outline: 'none', cursor: 'pointer' }}
                        />
                        <AppTooltip
                          anchorSelect={`#${infoIconId}`}
                          content={property.description}
                          offset={5}
                          noArrow
                          place="bottom"
                          positionStrategy="fixed"
                          delay={TooltipDelay.shortDelay}
                        />
                      </StyledInfoIconContainer>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </StyledFieldsContainer>
        </>
      )}
      {functionLink && (
        <StyledFooter>
          <UndecoratedLink to={functionLink}>
            <Button
              Icon={IconArrowUpRight}
              title={t`See function`}
              size="small"
              variant="secondary"
            />
          </UndecoratedLink>
        </StyledFooter>
      )}
    </Table>
  );
};
