import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { getPageLayoutTypeLabel } from '@/settings/layout/utils/getPageLayoutTypeLabel';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const DETAIL_GRID_TEMPLATE = '220px 1fr';
const WIDGETS_GRID_TEMPLATE = '1fr 160px 180px';

export const SettingsLayoutPageLayoutDetail = () => {
  const { t } = useLingui();
  const { pageLayoutId = '' } = useParams<{ pageLayoutId: string }>();

  const pageLayoutsWithRelations = useAtomStateValue(
    pageLayoutsWithRelationsSelector,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const pageLayoutsStoreStatus = useAtomFamilySelectorValue(
    metadataStoreStatusFamilySelector,
    'pageLayouts',
  );

  const pageLayout = pageLayoutsWithRelations.find(
    (p) => p.id === pageLayoutId,
  );
  const isLoading = pageLayoutsStoreStatus === 'empty';

  const resolveObjectLabel = (id: string | null | undefined) =>
    isDefined(id)
      ? objectMetadataItems.find((o) => o.id === id)?.labelSingular
      : undefined;

  const detailRows: { key: string; label: string; value: ReactNode }[] =
    isDefined(pageLayout)
      ? [
          { key: 'id', label: t`Identifier`, value: pageLayout.id },
          {
            key: 'type',
            label: t`Type`,
            value: getPageLayoutTypeLabel(pageLayout.type),
          },
          ...(isDefined(pageLayout.objectMetadataId)
            ? [
                {
                  key: 'object',
                  label: t`Object`,
                  value:
                    resolveObjectLabel(pageLayout.objectMetadataId) ??
                    pageLayout.objectMetadataId,
                },
              ]
            : []),
        ]
      : [];

  const sortedTabs = [...(pageLayout?.tabs ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  const title = pageLayout?.name ?? t`Page`;

  return (
    <SubMenuTopBarContainer
      title={title}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: <Trans>Layout</Trans>,
          href: getSettingsPath(SettingsPath.Layout),
        },
        {
          children: <Trans>Pages</Trans>,
          href: getSettingsPath(SettingsPath.LayoutManageItems),
        },
        { children: title },
      ]}
    >
      <SettingsPageContainer>
        {isLoading ? (
          <SettingsSectionSkeletonLoader />
        ) : !isDefined(pageLayout) ? (
          <Section>
            <H2Title
              title={t`Page not found`}
              description={t`This page does not exist in your workspace.`}
            />
          </Section>
        ) : (
          <>
            <Section>
              <H2Title
                title={t`Details`}
                description={t`Read-only page definition`}
              />
              <Table>
                <TableRow gridTemplateColumns={DETAIL_GRID_TEMPLATE}>
                  <TableHeader>{t`Property`}</TableHeader>
                  <TableHeader>{t`Value`}</TableHeader>
                </TableRow>
                {detailRows.map((row) => (
                  <TableRow
                    key={row.key}
                    gridTemplateColumns={DETAIL_GRID_TEMPLATE}
                  >
                    <TableCell color={themeCssVariables.font.color.secondary}>
                      {row.label}
                    </TableCell>
                    <TableCell minWidth="0" overflow="hidden">
                      {row.value}
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </Section>
            {sortedTabs.map((tab, index) => {
              const widgets = tab.widgets ?? [];
              const tabNumber = index + 1;

              const descriptionParts: string[] = [];
              if (isDefined(tab.layoutMode)) {
                descriptionParts.push(t`Layout mode: ${tab.layoutMode}`);
              }
              if (widgets.length > 0) {
                descriptionParts.push(
                  widgets.length === 1
                    ? t`1 widget`
                    : t`${widgets.length} widgets`,
                );
              }
              const description =
                descriptionParts.length > 0
                  ? descriptionParts.join(' · ')
                  : t`Empty tab`;

              return (
                <Section key={tab.id}>
                  <H2Title
                    title={t`Tab ${tabNumber}: ${tab.title}`}
                    description={description}
                  />
                  {widgets.length > 0 && (
                    <Table>
                      <TableRow gridTemplateColumns={WIDGETS_GRID_TEMPLATE}>
                        <TableHeader>{t`Widget`}</TableHeader>
                        <TableHeader>{t`Type`}</TableHeader>
                        <TableHeader>{t`Object`}</TableHeader>
                      </TableRow>
                      {widgets.map((widget) => (
                        <TableRow
                          key={widget.id}
                          gridTemplateColumns={WIDGETS_GRID_TEMPLATE}
                        >
                          <TableCell minWidth="0" overflow="hidden">
                            {widget.title}
                          </TableCell>
                          <TableCell>{widget.type}</TableCell>
                          <TableCell minWidth="0" overflow="hidden">
                            {resolveObjectLabel(widget.objectMetadataId) ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </Table>
                  )}
                </Section>
              );
            })}
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
