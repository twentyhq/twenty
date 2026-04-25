import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type DetailRow = { key: string; label: string; value: ReactNode };

const StyledMonoText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family}, monospace;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const GRID_TEMPLATE = '220px 1fr';

export const renderMonoText = (value: string | null | undefined): ReactNode => (
  <StyledMonoText>{value ?? t`Not set`}</StyledMonoText>
);

// Shared shell for a read-only detail page on an entity owned by an installed
// application: page chrome (breadcrumbs + title), an optional description
// block, and a Property/Value table. Centralizing this keeps the new layout
// pages (View, PageLayout, NavigationMenuItem) visually consistent with the
// existing FrontComponent detail page.
export const SettingsLayoutDetailScaffold = ({
  applicationId,
  applicationName,
  entityName,
  entityTypeLabel,
  description,
  detailRows,
  isLoading,
  children,
}: {
  applicationId: string;
  applicationName: string | undefined;
  entityName: string;
  entityTypeLabel: string;
  description?: string | null;
  detailRows: DetailRow[];
  isLoading: boolean;
  children?: ReactNode;
}) => {
  const trimmedDescription = description?.trim();

  const breadcrumbLinks = [
    { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
    {
      children: t`Applications`,
      href: getSettingsPath(SettingsPath.Applications),
    },
    {
      children: applicationName ?? '',
      href: getSettingsPath(
        SettingsPath.ApplicationDetail,
        { applicationId },
        undefined,
        'content',
      ),
    },
    { children: entityName },
  ];

  return (
    <SubMenuTopBarContainer title={entityName} links={breadcrumbLinks}>
      <SettingsPageContainer>
        {isLoading ? (
          <SettingsSectionSkeletonLoader />
        ) : (
          <>
            {isDefined(trimmedDescription) && trimmedDescription.length > 0 && (
              <Section>
                <H2Title
                  title={t`About`}
                  description={t`Description provided by the application`}
                />
                <StyledDescription>{trimmedDescription}</StyledDescription>
              </Section>
            )}
            <Section>
              <H2Title
                title={t`Details`}
                description={t`Read-only ${entityTypeLabel} definition shipped by this app`}
              />
              <Table>
                <TableRow gridTemplateColumns={GRID_TEMPLATE}>
                  <TableHeader>{t`Property`}</TableHeader>
                  <TableHeader>{t`Value`}</TableHeader>
                </TableRow>
                <TableBody>
                  {detailRows.map((row) => (
                    <TableRow key={row.key} gridTemplateColumns={GRID_TEMPLATE}>
                      <TableCell color={themeCssVariables.font.color.secondary}>
                        {row.label}
                      </TableCell>
                      <TableCell minWidth="0" overflow="hidden">
                        {row.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
            {children}
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
