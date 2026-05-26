import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { pageLayoutsWithRelationsSelector } from '@/page-layout/states/pageLayoutsWithRelationsSelector';
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
import { NavigationMenuItemType } from '~/generated-metadata/graphql';

const DETAIL_GRID_TEMPLATE = '220px 1fr';

export const SettingsLayoutSidebarItemDetail = () => {
  const { t } = useLingui();
  const { sidebarItemId = '' } = useParams<{ sidebarItemId: string }>();

  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const pageLayoutsWithRelations = useAtomStateValue(
    pageLayoutsWithRelationsSelector,
  );
  const navigationMenuItemsStoreStatus = useAtomFamilySelectorValue(
    metadataStoreStatusFamilySelector,
    'navigationMenuItems',
  );

  const sidebarItem = navigationMenuItems.find((i) => i.id === sidebarItemId);
  const isLoading = navigationMenuItemsStoreStatus === 'empty';

  const resolveTarget = (): string | undefined => {
    if (!isDefined(sidebarItem)) return undefined;
    switch (sidebarItem.type) {
      case NavigationMenuItemType.FOLDER:
        return t`Folder`;
      case NavigationMenuItemType.LINK:
        return sidebarItem.link ?? undefined;
      case NavigationMenuItemType.OBJECT:
        return objectMetadataItems.find(
          (o) => o.id === sidebarItem.targetObjectMetadataId,
        )?.labelPlural;
      case NavigationMenuItemType.PAGE_LAYOUT:
        return pageLayoutsWithRelations.find(
          (p) => p.id === sidebarItem.pageLayoutId,
        )?.name;
      case NavigationMenuItemType.VIEW:
        return views.find((v) => v.id === sidebarItem.viewId)?.name;
      case NavigationMenuItemType.RECORD:
        return sidebarItem.targetRecordIdentifier?.labelIdentifier ?? undefined;
      default:
        return undefined;
    }
  };

  const targetLabel = resolveTarget();

  const detailRows: { key: string; label: string; value: ReactNode }[] =
    isDefined(sidebarItem)
      ? [
          { key: 'id', label: t`Identifier`, value: sidebarItem.id },
          { key: 'type', label: t`Type`, value: sidebarItem.type },
          ...(isDefined(targetLabel)
            ? [{ key: 'target', label: t`Target`, value: targetLabel }]
            : []),
          ...(isDefined(sidebarItem.icon)
            ? [{ key: 'icon', label: t`Icon`, value: sidebarItem.icon }]
            : []),
          ...(isDefined(sidebarItem.color)
            ? [{ key: 'color', label: t`Color`, value: sidebarItem.color }]
            : []),
        ]
      : [];

  const title = sidebarItem?.name ?? t`Sidebar item`;

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
          children: <Trans>Sidebar</Trans>,
          href: getSettingsPath(SettingsPath.LayoutManageItems),
        },
        { children: title },
      ]}
    >
      <SettingsPageContainer>
        {isLoading ? (
          <SettingsSectionSkeletonLoader />
        ) : !isDefined(sidebarItem) ? (
          <Section>
            <H2Title
              title={t`Sidebar item not found`}
              description={t`This sidebar item does not exist in your workspace.`}
            />
          </Section>
        ) : (
          <Section>
            <H2Title
              title={t`Details`}
              description={t`Read-only sidebar item definition`}
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
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
