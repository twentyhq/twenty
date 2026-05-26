import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const DETAIL_GRID_TEMPLATE = '220px 1fr';
const FIELDS_GRID_TEMPLATE = '40px 1fr 80px 80px';
const FILTERS_GRID_TEMPLATE = '1fr 160px 1fr';
const SORTS_GRID_TEMPLATE = '1fr 120px';

const formatFilterValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
};

export const SettingsLayoutViewDetail = () => {
  const { t } = useLingui();
  const { viewId = '' } = useParams<{ viewId: string }>();

  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  const viewsStoreStatus = useAtomFamilySelectorValue(
    metadataStoreStatusFamilySelector,
    'views',
  );

  const view = views.find((v) => v.id === viewId);
  const isLoading = viewsStoreStatus === 'empty';

  const objectLabel = isDefined(view)
    ? objectMetadataItems.find((o) => o.id === view.objectMetadataId)
        ?.labelSingular
    : undefined;

  const resolveFieldLabel = (id: string): string =>
    flattenedFieldMetadataItems.find((f) => f.id === id)?.label ?? id;

  const detailRows: { key: string; label: string; value: ReactNode }[] =
    isDefined(view)
      ? [
          { key: 'id', label: t`Identifier`, value: view.id },
          { key: 'type', label: t`Type`, value: view.type },
          {
            key: 'object',
            label: t`Object`,
            value: objectLabel ?? view.objectMetadataId,
          },
          { key: 'icon', label: t`Icon`, value: view.icon },
          { key: 'visibility', label: t`Visibility`, value: view.visibility },
          {
            key: 'openRecordIn',
            label: t`Open records in`,
            value: view.openRecordIn,
          },
        ]
      : [];

  const sortedFields = [...(view?.viewFields ?? [])].sort(
    (a, b) => a.position - b.position,
  );
  const filters = view?.viewFilters ?? [];
  const sorts = view?.viewSorts ?? [];

  const title = view?.name ?? t`View`;

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
          children: <Trans>Views</Trans>,
          href: getSettingsPath(SettingsPath.LayoutManageItems),
        },
        { children: title },
      ]}
    >
      <SettingsPageContainer>
        {isLoading ? (
          <SettingsSectionSkeletonLoader />
        ) : !isDefined(view) ? (
          <Section>
            <H2Title
              title={t`View not found`}
              description={t`This view does not exist in your workspace.`}
            />
          </Section>
        ) : (
          <>
            <Section>
              <H2Title
                title={t`Details`}
                description={t`Read-only view definition`}
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
            {sortedFields.length > 0 && (
              <Section>
                <H2Title
                  title={t`Fields`}
                  description={t`Columns shown in this view, in display order`}
                />
                <Table>
                  <TableRow gridTemplateColumns={FIELDS_GRID_TEMPLATE}>
                    <TableHeader align="right">{t`#`}</TableHeader>
                    <TableHeader>{t`Field`}</TableHeader>
                    <TableHeader>{t`Visible`}</TableHeader>
                    <TableHeader align="right">{t`Size`}</TableHeader>
                  </TableRow>
                  {sortedFields.map((field) => (
                    <TableRow
                      key={field.id}
                      gridTemplateColumns={FIELDS_GRID_TEMPLATE}
                    >
                      <TableCell align="right">{field.position}</TableCell>
                      <TableCell minWidth="0" overflow="hidden">
                        {resolveFieldLabel(field.fieldMetadataId)}
                      </TableCell>
                      <TableCell>
                        {field.isVisible ? t`Yes` : t`Hidden`}
                      </TableCell>
                      <TableCell align="right">{field.size}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Section>
            )}
            {filters.length > 0 && (
              <Section>
                <H2Title
                  title={t`Filters`}
                  description={t`Conditions applied before records appear in this view`}
                />
                <Table>
                  <TableRow gridTemplateColumns={FILTERS_GRID_TEMPLATE}>
                    <TableHeader>{t`Field`}</TableHeader>
                    <TableHeader>{t`Operand`}</TableHeader>
                    <TableHeader>{t`Value`}</TableHeader>
                  </TableRow>
                  {filters.map((filter) => (
                    <TableRow
                      key={filter.id}
                      gridTemplateColumns={FILTERS_GRID_TEMPLATE}
                    >
                      <TableCell minWidth="0" overflow="hidden">
                        {resolveFieldLabel(filter.fieldMetadataId)}
                      </TableCell>
                      <TableCell>{filter.operand}</TableCell>
                      <TableCell minWidth="0" overflow="hidden">
                        {formatFilterValue(filter.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Section>
            )}
            {sorts.length > 0 && (
              <Section>
                <H2Title
                  title={t`Sorts`}
                  description={t`Order in which records are displayed`}
                />
                <Table>
                  <TableRow gridTemplateColumns={SORTS_GRID_TEMPLATE}>
                    <TableHeader>{t`Field`}</TableHeader>
                    <TableHeader>{t`Direction`}</TableHeader>
                  </TableRow>
                  {sorts.map((sort) => (
                    <TableRow
                      key={sort.id}
                      gridTemplateColumns={SORTS_GRID_TEMPLATE}
                    >
                      <TableCell minWidth="0" overflow="hidden">
                        {resolveFieldLabel(sort.fieldMetadataId)}
                      </TableCell>
                      <TableCell>{sort.direction}</TableCell>
                    </TableRow>
                  ))}
                </Table>
              </Section>
            )}
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
