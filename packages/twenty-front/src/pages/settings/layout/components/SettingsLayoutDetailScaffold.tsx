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

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  white-space: pre-wrap;
`;

const GRID_TEMPLATE = '220px 1fr';

export const SettingsLayoutDetailScaffold = ({
  applicationId,
  applicationName,
  entityName,
  entityTypeLabel,
  categoryLabel,
  description,
  detailRows,
  isLoading,
  children,
}: {
  applicationId: string;
  applicationName: string | undefined;
  entityName: string;
  entityTypeLabel: string;
  categoryLabel: string;
  description?: string | null;
  detailRows: DetailRow[];
  isLoading: boolean;
  children?: ReactNode;
}) => {
  const trimmedDescription = description?.trim();

  const applicationContentHref = getSettingsPath(
    SettingsPath.ApplicationDetail,
    { applicationId },
    undefined,
    'content',
  );

  const breadcrumbLinks = [
    { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
    {
      children: t`Applications`,
      href: getSettingsPath(SettingsPath.Applications),
    },
    { children: applicationName ?? '', href: applicationContentHref },
    { children: categoryLabel, href: applicationContentHref },
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
