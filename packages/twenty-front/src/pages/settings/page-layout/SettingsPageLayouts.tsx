import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import {
  H2Title,
  IconChevronRight,
  IconLayoutList,
  IconPlus,
  IconTrashX,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { savedPageLayoutsState } from '@/settings/page-layout/states/savedPageLayoutsState';

const StyledTableRow = styled(TableRow)`
  grid-template-columns: 180px 120px 100px 36px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledActionTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledIconDelete = styled(IconTrashX)`
  color: ${({ theme }) => theme.font.color.danger};
`;

export const SettingsPageLayouts = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const [savedPageLayouts, setSavedPageLayouts] = useRecoilState(
    savedPageLayoutsState,
  );

  const handleDelete = (id: string) => {
    setSavedPageLayouts((prev) => prev.filter((layout) => layout.id !== id));
  };

  return (
    <SubMenuTopBarContainer
      title={t`Page Layouts`}
      actionButton={
        <UndecoratedLink to="/settings/page-layout/new">
          <Button
            Icon={IconPlus}
            title={t`Add layout`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Page Layouts</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Existing layouts`} />

          <Table>
            <StyledTableRow>
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Type`}</TableHeader>
              <TableHeader>{t`Widgets`}</TableHeader>
              <TableHeader></TableHeader>
              <TableHeader></TableHeader>
            </StyledTableRow>
            {savedPageLayouts.map((layout) => (
              <StyledTableRow
                key={layout.id}
                to={`/settings/page-layout/${layout.id}`}
              >
                <StyledNameTableCell>
                  <IconLayoutList
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                  {layout.name}
                </StyledNameTableCell>
                <TableCell>{layout.type}</TableCell>
                <TableCell>
                  {layout.tabs.reduce(
                    (total, tab) => total + tab.widgets.length,
                    0,
                  )}
                </TableCell>
                <StyledActionTableCell
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(layout.id);
                  }}
                >
                  <StyledIconDelete
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                </StyledActionTableCell>
                <StyledActionTableCell>
                  <StyledIconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                </StyledActionTableCell>
              </StyledTableRow>
            ))}
          </Table>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
