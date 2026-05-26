import { frontComponentsSelector } from '@/front-components/states/frontComponentsSelector';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
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
import { type ReactNode, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const DETAIL_GRID_TEMPLATE = '220px 1fr';

const StyledMonoText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family}, monospace;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledPreviewFrame = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  height: 600px;
  overflow: auto;
  width: 100%;
`;

const StyledHeadlessNotice = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  justify-content: center;
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
  width: 100%;
`;

const StyledHeadlessTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledRendererContainer = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
`;

const formatDateTime = (isoString?: string | null): string => {
  if (isoString === undefined || isoString === null) {
    return '-';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleString();
};

export const SettingsLayoutFrontComponentDetail = () => {
  const { t } = useLingui();
  const { frontComponentId = '' } = useParams<{ frontComponentId: string }>();

  const frontComponents = useAtomStateValue(frontComponentsSelector);
  const frontComponentsStoreStatus = useAtomFamilySelectorValue(
    metadataStoreStatusFamilySelector,
    'frontComponents',
  );

  const frontComponent = frontComponents.find(
    (fc) => fc.id === frontComponentId,
  );
  const isLoading = frontComponentsStoreStatus === 'empty';

  const detailRows: { key: string; label: string; value: ReactNode }[] =
    isDefined(frontComponent)
      ? [
          { key: 'name', label: t`Name`, value: frontComponent.name },
          {
            key: 'componentName',
            label: t`Component name`,
            value: (
              <StyledMonoText>{frontComponent.componentName}</StyledMonoText>
            ),
          },
          {
            key: 'isHeadless',
            label: t`Headless`,
            value: frontComponent.isHeadless ? t`Yes` : t`No`,
          },
          {
            key: 'usesSdkClient',
            label: t`Uses SDK client`,
            value: frontComponent.usesSdkClient ? t`Yes` : t`No`,
          },
          ...(isDefined(frontComponent.description) &&
          frontComponent.description !== ''
            ? [
                {
                  key: 'description',
                  label: t`Description`,
                  value: frontComponent.description,
                },
              ]
            : []),
          {
            key: 'universalIdentifier',
            label: t`Universal identifier`,
            value: (
              <StyledMonoText>
                {frontComponent.universalIdentifier ?? t`Not set`}
              </StyledMonoText>
            ),
          },
          {
            key: 'builtComponentChecksum',
            label: t`Built component checksum`,
            value: (
              <StyledMonoText>
                {frontComponent.builtComponentChecksum}
              </StyledMonoText>
            ),
          },
          {
            key: 'createdAt',
            label: t`Created`,
            value: formatDateTime(frontComponent.createdAt),
          },
          {
            key: 'updatedAt',
            label: t`Updated`,
            value: formatDateTime(frontComponent.updatedAt),
          },
        ]
      : [];

  const title = frontComponent?.name ?? t`Front component`;

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
          children: <Trans>Front components</Trans>,
          href: getSettingsPath(SettingsPath.LayoutManageItems),
        },
        { children: title },
      ]}
    >
      <SettingsPageContainer>
        {isLoading ? (
          <SettingsSectionSkeletonLoader />
        ) : !isDefined(frontComponent) ? (
          <Section>
            <H2Title
              title={t`Front component not found`}
              description={t`This front component does not exist in your workspace.`}
            />
          </Section>
        ) : (
          <>
            <Section>
              <H2Title
                title={t`Preview`}
                description={t`Live render of the component as the app exposes it`}
              />
              <StyledPreviewFrame>
                {frontComponent.isHeadless ? (
                  <StyledHeadlessNotice>
                    <StyledHeadlessTitle>{t`Headless component`}</StyledHeadlessTitle>
                    <span>{t`This component runs without a UI and renders nothing here.`}</span>
                  </StyledHeadlessNotice>
                ) : (
                  <StyledRendererContainer>
                    <Suspense fallback={null}>
                      <FrontComponentRenderer
                        frontComponentId={frontComponent.id}
                      />
                    </Suspense>
                  </StyledRendererContainer>
                )}
              </StyledPreviewFrame>
            </Section>
            <Section>
              <H2Title
                title={t`Details`}
                description={t`Read-only front component definition`}
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
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
