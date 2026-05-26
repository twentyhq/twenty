import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
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
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const DETAIL_GRID_TEMPLATE = '220px 1fr';

const StyledMonoText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family}, monospace;
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SettingsLayoutCommandDetail = () => {
  const { t } = useLingui();
  const { commandMenuItemId = '' } = useParams<{
    commandMenuItemId: string;
  }>();

  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const frontComponents = useAtomStateValue(frontComponentsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const commandMenuItemsStoreStatus = useAtomFamilySelectorValue(
    metadataStoreStatusFamilySelector,
    'commandMenuItems',
  );

  const commandMenuItem = commandMenuItems.find(
    (item) => item.id === commandMenuItemId,
  );
  const isLoading = commandMenuItemsStoreStatus === 'empty';

  const frontComponent = isDefined(commandMenuItem?.frontComponentId)
    ? frontComponents.find((fc) => fc.id === commandMenuItem.frontComponentId)
    : undefined;

  const availabilityObject = isDefined(
    commandMenuItem?.availabilityObjectMetadataId,
  )
    ? objectMetadataItems.find(
        (o) => o.id === commandMenuItem.availabilityObjectMetadataId,
      )
    : undefined;

  const detailRows: { key: string; label: string; value: ReactNode }[] =
    isDefined(commandMenuItem)
      ? [
          { key: 'label', label: t`Label`, value: commandMenuItem.label },
          {
            key: 'shortLabel',
            label: t`Short label`,
            value: commandMenuItem.shortLabel ?? t`Not set`,
          },
          {
            key: 'icon',
            label: t`Icon`,
            value: isDefined(commandMenuItem.icon) ? (
              <StyledMonoText>{commandMenuItem.icon}</StyledMonoText>
            ) : (
              t`Not set`
            ),
          },
          {
            key: 'isPinned',
            label: t`Pinned`,
            value: commandMenuItem.isPinned ? t`Yes` : t`No`,
          },
          {
            key: 'availabilityType',
            label: t`Availability`,
            value: (
              <StyledMonoText>
                {commandMenuItem.availabilityType}
              </StyledMonoText>
            ),
          },
          {
            key: 'availabilityObject',
            label: t`Object scope`,
            value: isDefined(commandMenuItem.availabilityObjectMetadataId)
              ? (availabilityObject?.labelSingular ??
                commandMenuItem.availabilityObjectMetadataId)
              : t`All objects`,
          },
          {
            key: 'conditionalAvailabilityExpression',
            label: t`Conditional availability`,
            value: isDefined(
              commandMenuItem.conditionalAvailabilityExpression,
            ) ? (
              <StyledMonoText>
                {commandMenuItem.conditionalAvailabilityExpression}
              </StyledMonoText>
            ) : (
              t`Not set`
            ),
          },
          {
            key: 'frontComponent',
            label: t`Front component`,
            value: isDefined(frontComponent) ? (
              <StyledMonoText>{frontComponent.name}</StyledMonoText>
            ) : (
              t`Not set`
            ),
          },
        ]
      : [];

  const title = commandMenuItem?.label ?? t`Command`;

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
          children: <Trans>Commands</Trans>,
          href: getSettingsPath(SettingsPath.LayoutManageItems),
        },
        { children: title },
      ]}
    >
      <SettingsPageContainer>
        {isLoading ? (
          <SettingsSectionSkeletonLoader />
        ) : !isDefined(commandMenuItem) ? (
          <Section>
            <H2Title
              title={t`Command not found`}
              description={t`This command does not exist in your workspace.`}
            />
          </Section>
        ) : (
          <Section>
            <H2Title
              title={t`Details`}
              description={t`Read-only command definition`}
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
